import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import * as openid from 'openid-client';

@Injectable()
export class LinkedInStrategy {
  private client!: openid.Client;

  constructor(private auth: AuthService) {}

  private getClient() {
    if (this.client) {
      return this.client;
    }

    const issuer = new openid.Issuer({
      issuer: 'https://www.linkedin.com/oauth',
      authorization_endpoint: 'https://www.linkedin.com/oauth/v2/authorization',
      token_endpoint: 'https://www.linkedin.com/oauth/v2/accessToken',
      userinfo_endpoint: 'https://api.linkedin.com/v2/userinfo',
      jwks_uri: 'https://www.linkedin.com/oauth/openid/jwks',
    });

    this.client = new issuer.Client({
      client_id: process.env.LINKEDIN_CLIENT_ID!,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
      redirect_uris: [process.env.LINKEDIN_CALLBACK_URL!],
      response_types: ['code'],
      token_endpoint_auth_method: 'client_secret_post',
    });

    return this.client;
  }

  async getAuthUrl() {
    const client = this.getClient();

    return client.authorizationUrl({
      scope: 'openid profile email',
    });
  }

  async handleCallback(code: string) {
    const client = this.getClient();

    const tokenSet = await client.callback(
      process.env.LINKEDIN_CALLBACK_URL!,
      { code },
    );

    const userinfo = await client.userinfo(tokenSet.access_token!);
    const email = userinfo.email;

    if (typeof email !== 'string' || !email) {
      throw new Error('LinkedIn did not return a valid email');
    }

    return this.auth.findOrCreateOAuthUser({
      email,
      prenom: userinfo.given_name ?? '',
      nom: userinfo.family_name ?? '',
      provider: 'linkedin',
      avatarUrl: typeof userinfo.picture === 'string' ? userinfo.picture : undefined,
    });
  }
}
