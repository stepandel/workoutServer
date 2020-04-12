export function createResponse(status, body) {
  return {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    statusCode: status,
    body: JSON.stringify(body),
  };
}

// AWS Lanmbda function as input to async functions
export function lambdaWrap<RequestType, ResponseType>(
  asyncFunction: (RequestType) => Promise<ResponseType>
): (event, context, callback) => void {
  let wrapper = function (event, context, callback) {
    console.log(context.functionName, event.body);

    const data = JSON.parse(event.body);

    if (Object.keys(data).length == 0) {
      const response = createResponse(400, { error: 'empty request' });
      callback(null, response);
      return;
    }

    asyncFunction(data)
      .then((result: ResponseType) => {
        const response = createResponse(200, result);
        callback(null, response);
        return;
      })
      .catch((error) => {
        console.error(error);
        callback(null, createResponse(500, { error: error.message }));
        return;
      });
  };

  return wrapper;
}

// AWS Lanmbda function as input to async functions
export function lambdaGetWrap<ResponseType>(
  asyncFunction: () => Promise<ResponseType>
): (event, context, callback) => void {
  let wrapper = function (event, context, callback) {
    console.log(context.functionName, event.body);

    const data = JSON.parse(event.body);

    asyncFunction()
      .then((result: ResponseType) => {
        const response = createResponse(200, result);
        callback(null, response);
        return;
      })
      .catch((error) => {
        console.error(error);
        callback(null, createResponse(500, { error: error.message }));
        return;
      });
  };

  return wrapper;
}
