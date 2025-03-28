import { Injectable } from '@nestjs/common';
import { Item } from './models/item.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ItemsService {
  private items: Item[] = [];

  findAll(): Item[] {
    return this.items;
  }

  findOne(id: string): Item {
    return this.items.find(item => item.id === id);
  }

  create(name: string, description?: string): Item {
    const newItem = {
      id: uuidv4(),
      name,
      description,
    };
    
    this.items.push(newItem);
    return newItem;
  }
}
