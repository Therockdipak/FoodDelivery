const { expect } = require("chai");

describe("PizzaDelivery", function () {
  let pizzaDelivery;
  let restaurant;
  let deliveryBoy;
  let customer;

  const pizza = "Margherita";
  const quantity = 2;
  const orderPrice = quantity * 100;

  beforeEach(async function () {
    [restaurant, deliveryBoy, customer] = await ethers.getSigners();

    const PizzaDelivery = await ethers.getContractFactory("PizzaDelivery");
    pizzaDelivery = await PizzaDelivery.deploy();
    await pizzaDelivery.deployed();
  });

  it("should place an order", async function () {
    const orderPlacedTx = await pizzaDelivery
      .connect(customer)
      .placeOrder(pizza, quantity, {
        value: orderPrice,
      });

    await orderPlacedTx.wait();

    expect(await pizzaDelivery.order()).to.deep.equal({
      pizza: pizza,
      quantity: quantity,
      price: orderPrice,
    });

    expect(await pizzaDelivery.deliveryStatus()).to.equal(1); // OnTheWay status
  });

  it("should update delivery status and deliver the order", async function () {
    await pizzaDelivery.connect(customer).placeOrder(pizza, quantity, {
      value: orderPrice,
    });

    await pizzaDelivery.connect(deliveryBoy).updateDeliveryStatus(2); // Delivered status

    expect(await pizzaDelivery.deliveryStatus()).to.equal(2); // Delivered status
  });

  it("should withdraw funds for the delivery boy", async function () {
    await pizzaDelivery.connect(customer).placeOrder(pizza, quantity, {
      value: orderPrice,
    });

    // Ensure that the contract balance is updated after placing an order
    expect(await ethers.provider.getBalance(pizzaDelivery.address)).to.equal(
      orderPrice
    );

    await pizzaDelivery.connect(deliveryBoy).withdrawFunds();

    // Ensure that the contract balance is zero after the delivery boy withdraws funds
    expect(await ethers.provider.getBalance(pizzaDelivery.address)).to.equal(0);
  });
});
