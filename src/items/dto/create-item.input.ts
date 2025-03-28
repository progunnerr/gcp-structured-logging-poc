import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateItemInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;
}
