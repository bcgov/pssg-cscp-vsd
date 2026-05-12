using Task = System.Threading.Tasks.Task;

namespace Microsoft.Xrm.Sdk.Client;

public static class DataverseExtensions
{
    /// <summary>
    /// Adds a link between 2 entities
    /// </summary>
    /// <param name="context">The context</param>
    /// <param name="sourceEntity">The source entity to link to</param>
    /// <param name="relationshipName">The relationship name; it is case sensitive</param>
    /// <param name="linkedEntity">The target linked entity</param>
    public static void AddLink(
        [NotNull] this OrganizationServiceContext context,
        Entity sourceEntity,
        string relationshipName,
        Entity linkedEntity
    )
    {
        context.AddLink(sourceEntity, new Relationship(relationshipName), linkedEntity);
    }

    /// <summary>
    /// Adds a link between 2 entities and also adds the target linked entity
    /// </summary>
    /// <param name="context">The context</param>
    /// <param name="source">The source entity to link to</param>
    /// <param name="relationshipName">The relationship name; it is case sensitive</param>
    /// <param name="target">The target entity to add and link</param>
    public static void AddRelatedObject(
        [NotNull] this OrganizationServiceContext context,
        Entity source,
        string relationshipName,
        Entity target
    )
    {
        context.AddRelatedObject(source, new Relationship(relationshipName), target);
    }

    public static void LoadProperties(
        [NotNull] this OrganizationServiceContext context,
        IEnumerable<Entity> entities,
        params string[] propertyNames
    )
    {
        Parallel.ForEach(
            entities,
            entity =>
            {
                foreach (var property in propertyNames)
                {
                    context.LoadProperty(entity, property);
                }
            }
        );
    }

    private const int FileBlockSize = 4 * 1024 * 1024; // 4 MB

    /// <summary>
    /// Uploads a file
    /// </summary>
    /// <param name="organizationService">The organization service instance</param>
    /// <param name="entity">The entity with file or image field</param>
    /// <param name="fileFieldName">The file or image field name</param>
    /// <param name="file">The file data</param>
    /// <param name="ct">Optional cancellation token</param>
    /// <returns>The uploaded file id</returns>
    public static async Task<string?> UploadFileAsync(
        [NotNull] this IOrganizationServiceAsync organizationService,
        [NotNull] Entity entity,
        string? fileFieldName,
        [NotNull] FileContainer file,
        CancellationToken ct = default
    )
    {
        var response = (InitializeFileBlocksUploadResponse)
            await organizationService.ExecuteAsync(
                new InitializeFileBlocksUploadRequest
                {
                    Target = new EntityReference(entity.LogicalName, entity.Id),
                    FileAttributeName = fileFieldName,
                    FileName = file.FileName,
                }
            );

        var fileContinuationToken = response.FileContinuationToken;
        int blockNumber = 0;

        var slices = new List<ReadOnlyMemory<byte>>();
        int sliceIndex = 0;
        while (sliceIndex < file.Content.Length)
        {
            var left = file.Content.Length - sliceIndex;
            var slice = file.Content.Slice(sliceIndex, left > FileBlockSize ? FileBlockSize : left);
            slices.Add(slice);
            blockNumber++;
            sliceIndex += slice.Length;
        }

        var blockIds = new ConcurrentBag<string>();

        try
        {
            Parallel.ForEach(
                slices,
                new ParallelOptions { CancellationToken = ct },
                slice =>
                {
                    string blockId = Convert.ToBase64String(Encoding.UTF8.GetBytes(Guid.NewGuid().ToString()));

                    blockIds.Add(blockId);

                    organizationService.Execute(
                        new UploadBlockRequest()
                        {
                            BlockData = slice.ToArray(),
                            BlockId = blockId,
                            FileContinuationToken = fileContinuationToken,
                        }
                    );
                }
            );
        }
        catch (OperationCanceledException)
        {
            return null;
        }

        var commitFileBlocksUploadResponse = (CommitFileBlocksUploadResponse)
            await organizationService.ExecuteAsync(
                new CommitFileBlocksUploadRequest
                {
                    BlockList = blockIds.ToArray(),
                    FileContinuationToken = fileContinuationToken,
                    FileName = file.FileName,
                    MimeType = file.MimeType,
                }
            );

        return await Task.FromResult(commitFileBlocksUploadResponse.FileId.ToString());
    }

    private static RetrieveAttributeResponse GetAttribute(
        [NotNull] this OrganizationServiceContext context,
        [NotNull] Entity entity,
        string? fileFieldName
    )
    {
        return (RetrieveAttributeResponse)
            context.Execute(
                new RetrieveAttributeRequest { EntityLogicalName = entity.LogicalName, LogicalName = fileFieldName }
            );
    }

    /// <summary>
    /// Download a file or image
    /// </summary>
    /// <param name="organizationService">The organization service instance</param>
    /// <param name="entity">The entity with the file or image field</param>
    /// <param name="fileFieldName">The file or image field name</param>
    /// <param name="ct">Optional cancellation token</param>
    /// <returns>The file data, null if not found</returns>
    /// <exception cref="FileNotFoundException"></exception>
    public static async Task<FileContainer> DownloadFileAsync(
        [NotNull] this IOrganizationServiceAsync organizationService,
        [NotNull] Entity entity,
        string? fileFieldName,
        CancellationToken ct = default
    )
    {
        InitializeFileBlocksDownloadResponse response;
        try
        {
            response = (InitializeFileBlocksDownloadResponse)
                await organizationService.ExecuteAsync(
                    new InitializeFileBlocksDownloadRequest
                    {
                        Target = new EntityReference(entity.LogicalName, entity.Id),
                        FileAttributeName = fileFieldName,
                    }
                );
        }
        catch (FaultException<OrganizationServiceFault> ex) when (ex.Message.StartsWith("No file attachment found"))
        {
            throw new FileNotFoundException($"File not found", ex);
        }

        var offset = 0;

        using var ms = new MemoryStream();
        while (offset < response.FileSizeInBytes)
        {
            if (ct.IsCancellationRequested)
                break;
            var dlResponse = (DownloadBlockResponse)
                await organizationService.ExecuteAsync(
                    new DownloadBlockRequest
                    {
                        FileContinuationToken = response.FileContinuationToken,
                        BlockLength = FileBlockSize,
                        Offset = offset,
                    }
                );
            await ms.WriteAsync(dlResponse.Data, ct);
            offset += dlResponse.Data.Length;
        }

        return await Task.FromResult(
            new FileContainer(response.FileName, string.Empty, new ReadOnlyMemory<byte>(ms.ToArray()))
        );
    }

    /// <summary>
    /// Deletes a file or image
    /// </summary>
    /// <param name="context">The context</param>
    /// <param name="entity">The entity with the file or image field</param>
    /// <param name="fileFieldName">The file or image field name</param>
    /// <param name="ct">Optional cancellation token</param>
    public static async Task DeleteFileAsync(
        [NotNull] this OrganizationServiceContext context,
        [NotNull] Entity entity,
        string? fileFieldName,
        CancellationToken ct = default
    )
    {
        await Task.CompletedTask;

        var isImage = context.GetAttribute(entity, fileFieldName).AttributeMetadata is ImageAttributeMetadata;

        if (isImage)
        {
            entity.Attributes[fileFieldName] = null;
            context.UpdateObject(entity);
            context.SaveChanges();
        }
        else
        {
            if (!Guid.TryParse(entity[fileFieldName]?.ToString() ?? string.Empty, out var fileId))
                throw new InvalidOperationException(
                    $"Cannot find file id in entity {entity.LogicalName}.{fileId} with id {entity.Id}"
                );

            DeleteFileRequest deleteFileRequest = new() { FileId = fileId };

            context.Execute(deleteFileRequest);
        }
    }
}

public record FileContainer(string FileName, string MimeType, ReadOnlyMemory<byte> Content);
