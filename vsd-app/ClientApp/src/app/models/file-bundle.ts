// this interface defines a bundle of files converted to base64 and a parallell list of file names.
export interface FileBundle {
  // list of file names (same order as file array)
  fileName: string[];
  // description of the file (could be nothing)
  fileDescription: string[];
  // base64 encoded file turned into a string
  fileData: string[];
}
