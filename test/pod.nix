{
  pod = {
    kubernetes.pods.test = {
      annotations.environment = "production";
      containers.test = {
        image = "redis";
        ports = [{port = 6379;}];
      };
      volumes.test.type = "emptyDir";
    };
  };
}
