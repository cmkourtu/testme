# Scheduler Algorithm

This document describes the adaptive scheduling logic used by the platform. The scheduler is responsible for selecting which learning item a student should review next. It combines spaced‑repetition principles with an \epsilon-greedy policy.

## Overview

1. **Candidate Pools** – Items are divided into three pools based on review state:
   - **Due** – previously seen items where the next review date is today or earlier.
   - **New** – items that have never been shown to the learner.
   - **Stretch** – ahead-of-schedule items selected for occasional challenge.
2. **FSRS Recall Estimation** – For all previously reviewed items the scheduler computes the probability of recall using the FSRS algorithm. This uses the ease factor, interval, and difficulty parameters stored in `item_state`.
3. **\epsilon-Greedy Selection** – The scheduler chooses a pool according to a weighted rule (70 % due, 20 % new, 10 % stretch by default). Within the chosen pool, items are ordered by highest recall probability for due/stretch or lowest `id` for new.
4. **State Update** – After the learner answers an item, the scheduler updates `item_state` with the FSRS formulas to set the next due date and adjust the ease factor.

## FSRS Details

FSRS (Free Spaced Repetition Scheduler) predicts how likely a learner is to recall an item at any future time. It models two variables:

- **Memory State** – parameters `stability` and `difficulty` determine how fast recall decays.
- **Review Outcome** – each review result (Again, Hard, Good, Easy) modifies the parameters using pre‑trained coefficients.

The platform stores `stability`, `difficulty`, `ease`, and `last_review` per item. The update equations from FSRS 2024 are applied after every answer. For example:

```txt
new_stability = f(stability, difficulty, rating)
new_difficulty = g(difficulty, rating)
next_due = today + h(new_stability)
```

These functions are calibrated from open FSRS data so the next scheduled review keeps recall around 90 %.

## Candidate Pool Builder

The scheduler queries three lists before each session:

- `getDue(userId)` – items whose `next_due \<= today`.
- `getFirstUnseen(userId)` – the earliest item per objective that has not been answered.
- `getStretch(userId)` – random selection of items with `next_due` between 1 and 7 days in the future.

These functions live in the server package and return arrays of item IDs. Unit tests verify their behavior with seeded data.

## \epsilon-Greedy Selector

The selector chooses one of the pools using a deterministic random seed for testability. The default weights are 0.7 for due, 0.2 for new, and 0.1 for stretch. A different configuration can be supplied per course. Once a pool is chosen, the item with the highest `p_recall` (or lowest `id` for new) is served.

## Workflow Example

1. User requests `/api/session/next`.
2. Scheduler loads candidate pools and computes `p_recall` for due and stretch items.
3. The \epsilon-greedy rule picks a pool and returns the chosen item.
4. After the user submits an answer to `/api/session/:itemId/answer`, the scheduler updates `item_state` and recomputes `next_due`.

The Scheduler algorithm therefore ensures a balance between reinforcing known material and introducing new or challenging content in a principled manner.
