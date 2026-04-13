# Architecture — WeddingBudget.AI

## System Overview
3-tier: React SPA → FastAPI → PostgreSQL

## Database Schema (9 tables)
- artists: name, type, min_fee, max_fee, city
- fb_rates: meal_type, tier, per_head_cost
- logistics_costs: city, service_type, unit_cost
- decor_images: filename, function_type, style,
  complexity, seed_cost, is_labelled
- budget_tracker: session_id, category,
  estimated, actual
- admin_settings: key, value
- cost_versions: audit trail
- rl_agent_state: category, multiplier
- rl_training_log: estimated, actual,
  ratio, accuracy_delta

## ML Pipeline
### Decor Cost Predictor
- MobileNetV2 extracts 1280-dim embeddings
- PCA reduces to 50 dims
- GradientBoosting predicts cost range
- Auto-labels 299 images on startup
- Confidence from estimator variance

### PSO Budget Optimizer
- 30 particles, 50 iterations
- Adaptive inertia
- Per-category reallocation

### RL Learning Agent
- Multi-Armed Bandit (ε=0.15, α=0.1)
- Admin logs actual vendor costs
- Multipliers update per category
- Bounds: [0.5, 2.0]

## Security
- JWT auth on all admin endpoints
- Pydantic validation
- CORS configured
- Audit trail on cost changes