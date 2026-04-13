# WeddingBudget.AI — Product Document
### WedTech IIT Innovation Challenge 2026
### Team: Sripathi Rajan & Ishwaryah

## 1. Executive Summary
WeddingBudget.AI is an AI-powered wedding budget
estimation engine built for Indian wedding planners.
Replaces gut-feel estimation with data-driven
predictions across all 6 major cost heads using
Machine Learning, PSO, and Reinforcement Learning.

## 2. Problem Statement Alignment
| Module | Built | Tech |
|---|---|---|
| Smart Input Wizard | ✅ | React 8-tab form |
| Decor Intelligence Library | ✅ | MobileNetV2 + GradientBoosting |
| Logistics Cost Engine | ✅ | City-wise rate DB |
| Artist Cost Mapper | ✅ | Admin-editable DB |
| F&B Budget Module | ✅ | Per-head calculator |
| Sundries & Basics | ✅ | Guest-count formula |
| Budget Output & Report | ✅ | PDF + WhatsApp |
| Admin Labelling Interface | ✅ | JWT-protected panel |
| Scraping Pipeline | ✅ | 299 images, 6 categories |
| RL Self-Learning Agent | ✅ | Multi-Armed Bandit ε=0.15 |

## 3. Technical Architecture
- Frontend: React 18 + Vite + Framer Motion
- Backend: FastAPI + Python 3.11
- Database: PostgreSQL + SQLAlchemy
- Deployment: Vercel + Render

## 4. ML Innovation
### Decor AI
MobileNetV2 extracts visual embeddings.
GradientBoosting predicts cost range.
Auto-labelling with KMeans clustering.
True confidence from estimator variance.

### PSO Optimizer
30 particles explore budget space.
50 iterations converge on optimal split.
Adaptive inertia prevents local optima.

### RL Agent
Multi-Armed Bandit learns from vendor invoices.
Admin logs actual costs → multipliers update.
Estimates improve automatically over time.

## 5. Admin Panel (8 Controls)
1. Pricing rules (city, hotel, per-head)
2. AI training data (decor tagging)
3. Logistics formulas
4. Artist/vendor database
5. Food & catering pricing
6. Miscellaneous costs
7. Budget calculation rules
8. Model training + monitoring

## 6. Security
JWT, Pydantic validation, CORS, audit trail.

## 7. Future Roadmap
- 10,000+ image dataset
- Mobile app
- Real vendor API integration
- Multi-planner collaboration

## 8. Assumptions
- Costs based on 2024-2026 Indian market rates
- RL needs minimum 10 bookings for reliable adjustment
- Free tier hosting has 50s cold start

---
Built for Indian weddings | WedTech 2026