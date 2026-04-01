import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-linkedin-oauth2';
import { AuthService } from '../auth.service';

@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor(private auth: AuthService) {
    super({
      clientID:     process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      callbackURL:  process.env.LINKEDIN_CALLBACK_URL!,
      scope: ['openid', 'profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ) {
    const user = await this.auth.findOrCreateOAuthUser({
      email:    profile.emails[0].value,
      prenom:   profile.name.givenName  ?? profile.displayName?.split(' ')[0] ?? '',
      nom:      profile.name.familyName ?? profile.displayName?.split(' ')[1] ?? '',
      provider: 'linkedin',
    });
    done(null, user);
  }
}