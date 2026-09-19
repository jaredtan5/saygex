# Connect Four Fantasy Redesign

## Goal
Replace the Shopify storefront with a playable Connect Four game styled as an original magical-fantasy adventure experience inspired by *Mushoku Tensei*, without copying protected characters or artwork.

## What will change
- Remove the shop header, product grid, product pages, cart drawer, cart syncing, and Shopify-specific code.
- Make the home screen the game itself, with a prominent board, turn status, score tracking, restart controls, and clear win/draw states.
- Support two players on the same device with legal Connect Four placement, win detection, draw detection, and highlighted winning pieces.
- Add an atmospheric fantasy academy setting through original generated artwork, parchment-and-magic styling, restrained animation, and responsive mobile/desktop layouts.
- Update page titles and sharing descriptions to match the game.

## Technical details
- Keep the existing TanStack Start app structure and design-system components.
- Implement game state and rules locally in React; no account or saved database is needed.
- Use semantic color tokens in the global stylesheet and remove unused storefront dependencies/files where safe.
- Verify gameplay, reset behavior, win detection, console state, and desktop/mobile rendering in the running preview.
