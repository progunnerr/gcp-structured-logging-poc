import { Injectable } from '@nestjs/common';
import { Item } from './models/item.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ItemsService {
  private items: Item[] = [
    {
      id: 'ctd',
      name: 'CertainTeed',
      description: 'CertainTeed has established a reliable name for roofing materials over its 100+ years of operation.'
    },
    {
      id: 'gsf',
      name: 'GAF',
      description: 'GAF has manufactured roofing materials for over 130 years and sells more shingles annually than any other company. Its Timberline HD Ultra Shingles are known for durability, beauty, and performance without severe bulk. GAF also offers a lifetime limited warranty on its products, so you can be sure that your roof will stand the test of time'
    },
    {
      id: 'mlk',
      name: 'Malarkey Roofing Products',
      description: 'Malarkey Roofing Products is known for its sustainability and eco-friendly materials. It uses NEX® Polymer Modified (Rubberized) Asphalt to create its shingles, composed of recycled rubber and plastics.'
    },
    {
      id: 'iko',
      name: 'IKO',
      description: 'IKO produces durable asphalt shingles and accessories that withstand high winds and temperatures.'
    },
    {
      id: 'owc',
      name: 'Owens Corning',
      description: 'Owens Corning is a global leader in roofing materials. Its most popular product line is the TruDefinition Duration Architectural Shingles, designed for maximum wind resistance and available in numerous colors to match any exterior style. ',
    }
  ];

  findAll(): Item[] {
    return this.items;
  }

  findOne(id: string): Item | null {
    return this.items.find(item => item.id === id) || null;
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
