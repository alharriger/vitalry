# Avatar

Round player avatar. Without an image it shows initials on a warm color deterministically derived from the name — so the same person is always the same color across leaderboard, group, and results.

```jsx
<Avatar name="Amber Harriger" size="lg" />
<Avatar name="Dad" size="md" ring />        {/* gold winner ring */}
<Avatar name="Mo" src="/photo.jpg" size="sm" />
```

- **size**: `xs` 28 · `sm` 36 · `md` 44 · `lg` 56 · `xl` 76
- **ring**: gold ring to mark the competition winner
- **color**: override the auto color when needed
