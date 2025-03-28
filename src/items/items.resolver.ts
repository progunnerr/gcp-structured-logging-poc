import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Item } from './models/item.model';
import { ItemsService } from './items.service';

@Resolver(() => Item)
export class ItemsResolver {
  constructor(private itemsService: ItemsService) {}

  @Query(() => [Item])
  items(): Item[] {
    return this.itemsService.findAll();
  }

  @Query(() => Item, { nullable: true })
  item(@Args('id') id: string): Item {
    return this.itemsService.findOne(id);
  }

  @Mutation(() => Item)
  createItem(
    @Args('name') name: string,
    @Args('description', { nullable: true }) description?: string,
  ): Item {
    return this.itemsService.create(name, description);
  }
}
