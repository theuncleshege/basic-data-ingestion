export default ({
  body,
  method = 'GET',
  path = '',
  queryStringObject = null,
  pathParametersObject = null,
  stageVariables = null,
}: {
  [name: string]: any;
}): any => {
  const request = {
    body: body && JSON.stringify(body),
    headers: {},
    multiValueHeaders: {},
    httpMethod: method,
    isBase64Encoded: false,
    path,
    pathParameters: pathParametersObject,
    queryStringParameters: queryStringObject,
    multiValueQueryStringParameters: null,
    stageVariables,
    requestContext: {
      accountId: '',
      apiId: '',
      httpMethod: method,
      authorizer: '',
      identity: {
        accessKey: '',
        accountId: '',
        apiKey: '',
        apiKeyId: '',
        caller: '',
        cognitoAuthenticationProvider: '',
        cognitoAuthenticationType: '',
        cognitoIdentityId: '',
        cognitoIdentityPoolId: '',
        principalOrgId: '',
        sourceIp: '',
        user: '',
        userAgent: '',
        userArn: '',
      },
      path,
      stage: '',
      requestId: '',
      requestTimeEpoch: 3,
      resourceId: '',
      resourcePath: '',
      protocol: '',
    },
    resource: '',
  };
  return request;
};
