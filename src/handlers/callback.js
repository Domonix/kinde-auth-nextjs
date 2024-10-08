import {config} from '../config/index';
import RouterClient from '../routerClients/RouterClient';

/**
 *
 * @param {RouterClient} routerClient
 */
export const callback = async (routerClient) => {
  const postLoginRedirectURLFromMemory =
    await routerClient.sessionManager.getSessionItem('post_login_redirect_url');

  if (postLoginRedirectURLFromMemory) {
    routerClient.sessionManager.removeSessionItem('post_login_redirect_url');
  }

  const postLoginRedirectURL = postLoginRedirectURLFromMemory
    ? postLoginRedirectURLFromMemory
    : config.postLoginRedirectURL;
  try {
    await routerClient.kindeClient.handleRedirectToApp(
      routerClient.sessionManager,
      routerClient.getUrl()
    );
  } catch (error) {
    if (routerClient.clientConfig.loginCallback) {
      const callbackResponse = await routerClient.clientConfig.loginCallback(
        routerClient,
        error,
        postLoginRedirectURL
      );
      if (callbackResponse) return callbackResponse;
    }

    return routerClient.json({error: error.message}, {status: 500});
  }

  if (routerClient.clientConfig.loginCallback) {
    const callbackResponse = await routerClient.clientConfig.loginCallback(
      routerClient,
      null,
      postLoginRedirectURL
    );
    if (callbackResponse) return callbackResponse;
  }

  if (postLoginRedirectURL) return routerClient.redirect(postLoginRedirectURL);

  return routerClient.redirect(routerClient.clientConfig.siteUrl);
};
