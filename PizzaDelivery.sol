// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract PizzaDelivery {
    address payable public immutable restaurant;
    address payable public immutable deliveryBoy;
    address public customer;

    struct Order {
        string pizza;
        uint256 quantity;
        uint256 price;
    }

    Order public order;

    enum DeliveryStatus {
        Pending,
        OnTheWay,
        Delivered
    }

    DeliveryStatus public deliveryStatus;

    event OrderPlaced(address indexed customer);
    event OrderDelivered(address indexed customer);

    constructor() {
        restaurant = payable(msg.sender);
        deliveryBoy = payable(msg.sender);
    }

    modifier onlyDeliveryBoy() {
        require(
            msg.sender == deliveryBoy,
            "Only the delivery boy can call this."
        );
        _;
    }

    modifier orderInProgress() {
        require(
            deliveryStatus == DeliveryStatus.Pending,
            "Order is already in progress."
        );
        _;
    }

    function placeOrder(
        string memory _pizza,
        uint256 _quantity
    ) public payable orderInProgress {
        require(_quantity > 0, "Quantity should be greater than zero.");
        require(
            msg.value == _quantity * 100 wei,
            "Payment amount should match the order price."
        );

        order.pizza = _pizza;
        order.quantity = _quantity;
        order.price = _quantity * 100 wei;

        restaurant.transfer(order.price);

        deliveryStatus = DeliveryStatus.OnTheWay;
        customer = msg.sender; // Set the customer address to msg.sender when placing the order.

        emit OrderPlaced(customer);
    }

    function updateDeliveryStatus(
        DeliveryStatus _deliveryStatus
    ) public onlyDeliveryBoy {
        require(
            deliveryStatus != DeliveryStatus.Delivered,
            "Order has already been delivered."
        );
        require(
            _deliveryStatus == DeliveryStatus.OnTheWay ||
                _deliveryStatus == DeliveryStatus.Delivered,
            "Invalid delivery status."
        );

        deliveryStatus = _deliveryStatus;

        if (_deliveryStatus == DeliveryStatus.Delivered) {
            emit OrderDelivered(customer);
        }
    }

    function withdrawFunds() public onlyDeliveryBoy {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw.");
        deliveryBoy.transfer(balance);
    }
}
