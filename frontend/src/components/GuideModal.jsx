import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const sections = [
    {
      icon: '💍',
      title: '1. Style & Essence',
      desc: 'Select your date, cultural style, and budget tier. We support ALL Indian wedding types!'
    },
    {
      icon: '🏛️',
      title: '2. Venue & Guests',
      desc: 'Pick your venue type and location. Guest count is critical for F&B estimation.'
    },
    {
      icon: '🎨',
      title: '3. Decor AI (Visuals)',
      desc: 'Browse or upload decor images. Our AI (MobileNetV2) predicts costs based on visual complexity.'
    },
    {
      icon: '🍽️',
      title: '4. Food & Catering',
      desc: 'Choose dietary preferences and budget tiers for a per-plate cost breakdown.'
    },
    {
      icon: '🎭',
      title: '5. Entertainment',
      desc: 'Book artists, DJs, and live performers directly from our vendor database.'
    },
    {
      icon: '💰',
      title: '8. PSO Optimization',
      desc: 'Our PSO Agent runs 50 iterations to find the most value-for-money budget split.'
    },
    {
      icon: '⚙️',
      title: 'Admin Panel',
      desc: 'Login with admin/shaadi@admin2026 to see the RL agent stats and pricing control.'
    }
  ];

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          style={{
            background: 'white', borderRadius: 24, width: '100%', maxWidth: 700,
            maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '24px 32px', borderBottom: '1px solid #f0f0f0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'linear-gradient(135deg, #fdf2f8 0%, #ffffff 100%)'
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111' }}>
                Walkthrough Guide
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#666' }}>
                How to explore the WeddingBudget.AI innovation.
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 36, height: 36, borderRadius: '50%', border: 'none',
                background: '#f3f4f6', cursor: 'pointer', fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '0 32px 32px 32px', overflowY: 'auto', flex: 1 }}>
            <div style={{ marginTop: 24, display: 'grid', gap: 16 }}>
              {sections.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 16, padding: 16, borderRadius: 16,
                  background: '#f9fafb', border: '1px solid #efeff1'
                }}>
                  <div style={{
                    fontSize: 24, width: 48, height: 48, borderRadius: 12,
                    background: 'white', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                  }}>
                    {s.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: 15, fontWeight: 700, color: '#111' }}>
                      {s.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: 13, color: '#4b5563', lineHeight: 1.5 }}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 24, padding: 20, borderRadius: 16,
              background: 'linear-gradient(135deg, #1a1a2e, #2d1b33)', color: 'white'
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: '#ff66b2' }}>PRO TIP</h4>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, opacity: 0.9 }}>
                Check out the <b>PSO Optimizer</b> on the final tab. It runs a live particle swarm simulation
                to find the best budget split! Also, visit <b>/admin</b> to see the <b>Reinforcement Learning</b>
                multipliers that evolve as weddings are booked.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '16px 32px', borderTop: '1px solid #f0f0f0', textAlign: 'right' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 24px', borderRadius: 12, border: 'none',
                background: '#e91e8c', color: 'white', fontWeight: 700,
                fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 12px rgba(233, 30, 140, 0.3)'
              }}
            >
              Got it, let's explore!
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GuideModal;
