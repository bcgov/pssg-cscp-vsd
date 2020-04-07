    
package bc;

class baseConfig {
  // Wait timeout in minutes
  public static final int WAIT_TIMEOUT = 10

  // Deployment Environment TAGs
  public static final String[] DEPLOYMENT_ENVIRONMENT_TAGS = ['bc-test']

  // The name of the project namespace(s).
  public static final String  NAME_SPACE = 'pssg-cscp'

  // Instance Suffix
  public static final String  SUFFIX = '-vsd'

  // Apps - Listed in the order they should be tagged
  public static final String[] APPS = ['agent', 'api']
}
