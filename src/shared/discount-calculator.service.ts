import { Injectable } from '@nestjs/common';
import { DiscountContains, DiscountRules } from 'src/schemas/property.schema';

@Injectable()
export class DiscountCalculatorService {
  constructor() {}

  findDiscount = (contains: DiscountContains, property) =>
    property.discount.find((discount) => {
      return discount.contains.includes(contains as any);
    });

  calculateChildrenDiscount({ price, noOfChildren, property }) {
    let temp = 0;
    temp += price.amount * noOfChildren;
    let discountedAmount = 0;

    const discount = this.findDiscount(DiscountContains.PER_CHILDREN, property);
    const normalDiscount = this.findDiscount(DiscountContains.NORMAL, property);
    if (discount && DiscountRules.GREATER_THAN) {
      discountedAmount = temp - (temp * discount.amountInPercent) / 100;
    } else if (normalDiscount && DiscountRules.GREATER_THAN) {
      discountedAmount = temp - (temp * normalDiscount.amountInPercent) / 100;
    }

    return { originalAmount: temp, discountedAmount: discountedAmount };
  }

  calculatePersonDiscount({ price, noOfPeople, property }) {
    let temp = 0;
    temp += price.amount * noOfPeople;
    let discountedAmount = 0;

    const discount = this.findDiscount(DiscountContains.PER_PEOPLE, property);
    const normalDiscount = this.findDiscount(DiscountContains.NORMAL, property);
    if (discount && DiscountRules.GREATER_THAN) {
      discountedAmount = temp - (temp * discount.amountInPercent) / 100;
    } else if (normalDiscount && DiscountRules.GREATER_THAN) {
      discountedAmount = temp - (temp * normalDiscount.amountInPercent) / 100;
    }
    return { originalAmount: temp, discountedAmount: discountedAmount };
  }

  calculateNormalDiscount({ property, totalAmount }): number {
    const isNormalDiscount = this.findDiscount(
      DiscountContains.NORMAL,
      property,
    );
    if (!isNormalDiscount) return 0;
    let temp = (totalAmount * isNormalDiscount.amountInPercent) / 100;
    return temp;
  }
}
