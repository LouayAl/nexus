// backend/src/geocoding/geocoding.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('geocoding')
export class GeocodingController {
  constructor(private config: ConfigService) {}

  @Get('autocomplete')
  async autocomplete(@Query('q') q: string) {
    if (!q || q.length < 2) return [];

    const key = this.config.get('GEOAPIFY_KEY');
    const url = new URL('https://api.geoapify.com/v1/geocode/autocomplete');
    url.searchParams.set('text', q);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '6');
    url.searchParams.set('lang', 'fr');
    url.searchParams.set('apiKey', key);

    const res = await fetch(url.toString());
    const data = await res.json();

    const seen = new Set<string>();
    return (data.results as any[])
    .filter((d: any) => d.country && (d.city || d.formatted))
    .map((d: any) => ({
        short: d.city
        ? `${d.city}, ${d.country}`
        : `${d.formatted.split(',')[0].trim()}, ${d.country}`,
    }))
    .filter(({ short }) => {
        if (seen.has(short)) return false;
        seen.add(short);
        return true;
    });
  }
}