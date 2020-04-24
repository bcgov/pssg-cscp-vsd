void call(String appName, String appSuffix, String namespace, String envTag) {
  openshift.withCluster() {
    openshift.withProject() {

      echo "JT: Tagging ${appName} for deployment to ${envTag} ..."

      // Don't tag with BUILD_ID so the pruner can do it's job; it won't delete tagged images.
      // Tag the images for deployment based on the image's hash
      def IMAGE_HASH = getImageTagHash(openshift, "${appName}")
      echo "IMAGE_HASH: ${IMAGE_HASH}"
      echo "JT(VDG): Tagging: ${appName}@${IMAGE_HASH} / ${appName}:${envTag}"
      openshift.tag("${appName}@${IMAGE_HASH}", "${appName}:${envTag}")
      echo "JT(VDG): Finished tagging"
    }

    echo "Watching rollout of ${appName}${appSuffix} in ${namespace}-${envTag} ..."
    openshift.withProject("${namespace}-${envTag}") {
    //openshift.withProject("${namespace}") {
        def dc = openshift.selector('dc', "${appName}${appSuffix}")
        //def dc = openshift.selector('dc', "vsd")
        // Wait for the deployment to complete.
        // This will wait until the desired replicas are all available
        dc.rollout().status()
    }

    echo "Deployment Complete."
  }
}
