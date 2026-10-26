import { Transform } from 'class-transformer';
import {
  ArrayMaxSize, IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, Matches, MaxLength,
} from 'class-validator';

// NFKC turns lookalikes (fullwidth "ｗｗｗ．ｅｘ…") into plain ASCII before we validate,
// so they can't slip past the link check. Also collapses whitespace.
const clean = (v: unknown) =>
  typeof v === 'string' ? v.normalize('NFKC').replace(/\s+/g, ' ').trim() : v;

// Letters (any language, Arabic included), digits, space and the few punctuation marks used in amounts.
// No < > @ : ; = & # \ ` { } [ ] | so no markup, emails or "javascript:" strings.
const SAFE_TEXT = /^[\p{L}\p{N} .,'’%€$£()\/+\-–]*$/u;
// Rejects anything that looks like a link or domain: www, bit.ly/x, example.com ...
const NO_LINK = /^(?!.*(?:www|[\p{L}\p{N}\-]+\.\p{L}{2,})).*$/iu;

const TEXT_MSG = 'Caractères non autorisés';
const LINK_MSG = 'Les liens ne sont pas autorisés';

export class UpdateRemunerationDto {
  @IsOptional()
  @Transform(({ value }) => clean(value))
  @IsString() @MaxLength(60)
  @Matches(SAFE_TEXT, { message: TEXT_MSG })
  @Matches(NO_LINK,  { message: LINK_MSG })
  salaireActuel?: string;

  @IsOptional()
  @Transform(({ value }) => clean(value))
  @IsString() @MaxLength(60)
  @Matches(SAFE_TEXT, { message: TEXT_MSG })
  @Matches(NO_LINK,  { message: LINK_MSG })
  pretentionsSalariales?: string;

  @IsOptional() @IsBoolean() primes?: boolean;
  @IsOptional() @IsBoolean() vehiculeFonction?: boolean;
  @IsOptional() @IsBoolean() vehiculeService?: boolean;

  @IsOptional()
  @IsArray() @ArrayMaxSize(20)
  @Transform(({ value }) => (Array.isArray(value) ? value.map(clean) : value))
  @IsString({ each: true }) @IsNotEmpty({ each: true }) @MaxLength(40, { each: true })
  @Matches(SAFE_TEXT, { each: true, message: TEXT_MSG })
  @Matches(NO_LINK,  { each: true, message: LINK_MSG })
  avantagesSociaux?: string[];
}