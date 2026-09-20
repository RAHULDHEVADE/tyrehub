# TyreHub — realistic frontend demo

A responsive, frontend-only tyre ecommerce portfolio site inspired by the supplied reference screenshots. It includes manual brand browsing, product cards, filters, compare, cart, demo authentication, checkout with UPI/card/net-banking/wallet/COD choices, order confirmation and order history.

## Run

Serve the `tyrehub` folder with a static server, for example:

`python -m http.server 4173`

Then open `http://localhost:4173/`.

## Important behavior

No UI control is triggered automatically. Navigation, filters, tabs, add-to-cart, compare, quantity changes and checkout are driven only by user interaction. Demo state uses browser LocalStorage; no real payment is processed and no backend is required.


## Realistic visual assets

The refreshed build preserves the original homepage structure and uses realistic tyre/vehicle imagery derived from the user-provided reference screenshots. Product cards use real tyre photography rather than CSS-generated tyre illustrations.

## Interaction safeguards

User-action handlers ignore untrusted synthetic click/submit events. Cart operations are persisted in browser LocalStorage and only change after an explicit user action.
