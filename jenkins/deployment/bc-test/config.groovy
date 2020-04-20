// Pipeline Configuration Properties
// Import this file into the pipeline using 'load'.
class config extends bc.baseConfig {
  // Deployment configuration
  public static final String SOURCE_TAG = "${super.DEPLOYMENT_ENVIRONMENT_TAGS[0]}"
  echo SOURCE_TAG ;
  public static final String DESTINATION_TAG = "${super.DEPLOYMENT_ENVIRONMENT_TAGS[1]}"
  echo DESTINATION_TAG;
}

return new config();
