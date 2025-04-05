import { Injectable } from '@nestjs/common';
import { DiscountContains, DiscountRules } from 'src/schemas/property.schema';

@Injectable()
export class DiscountCalculatorService {
  constructor() {}

  findDiscount = (contains: DiscountContains, property) =>
    (property.discount || []).find((discount) => {
      return discount.contains.includes(contains as any);
    });

  calculateChildrenDiscount({ price, noOfChildren, property }) {
    let temp = 0;
    temp += price.amount * noOfChildren;
    let discountedAmount = 0;
    let offerMessage = null;

    const discount = this.findDiscount(DiscountContains.PER_CHILDREN, property);
    const normalDiscount = this.findDiscount(DiscountContains.NORMAL, property);
    if (discount && DiscountRules.GREATER_THAN) {
      discountedAmount = temp - (temp * discount.amountInPercent) / 100;
      offerMessage = discount.label;
    } else if (normalDiscount && DiscountRules.GREATER_THAN) {
      discountedAmount = temp - (temp * normalDiscount.amountInPercent) / 100;
      offerMessage = normalDiscount.label;
    }

    return {
      originalAmount: temp,
      discountedAmount: discountedAmount,
      offerMessage
    };
  }

  calculatePersonDiscount({ price, noOfPeople, property }) {
    let temp = 0;
    temp += price.amount * noOfPeople;
    let discountedAmount = 0;
    let offerMessage = null;

    const discount = this.findDiscount(DiscountContains.PER_PEOPLE, property);
    const normalDiscount = this.findDiscount(DiscountContains.NORMAL, property);
    if (discount && DiscountRules.GREATER_THAN) {
      discountedAmount = temp - (temp * discount.amountInPercent) / 100;
      offerMessage = discount.label;
    } else if (normalDiscount && DiscountRules.GREATER_THAN) {
      discountedAmount = temp - (temp * normalDiscount.amountInPercent) / 100;
      offerMessage = normalDiscount.label;
    }

    return {
      originalAmount: temp,
      discountedAmount: discountedAmount,
      offerMessage
    };
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
