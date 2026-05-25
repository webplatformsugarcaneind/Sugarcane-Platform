import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import './FactoryAnalysisPage.css';

/**
 * Premium SVG Icons
 */
const Icons = {
  Loader: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="fap-spin-icon" style={{width:'1em',height:'1em'}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>),
  Chart: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:'1em',height:'1em',verticalAlign:'-0.125em'}}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18"/><path strokeLinecap="round" strokeLinejoin="round" d="m19 9-5 5-4-4-3 3"/></svg>),
  Trophy: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:'1em',height:'1em',verticalAlign:'-0.125em'}}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M5.25 9V6.75c0-.414.336-.75.75-.75h12c.414 0 .75.336.75.75V9c0 4.142-3.358 7.5-7.5 7.5h-1.5C6.608 16.5 3.25 13.142 3.25 9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5v3.75M9 20.25h6" /></svg>),
  Location: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:'1em',height:'1em',verticalAlign:'-0.125em'}}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z" /></svg>),
  Star: () => (<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" style={{width:'1em',height:'1em',verticalAlign:'-0.125em'}}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>),
  Scale: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:'1em',height:'1em',verticalAlign:'-0.125em'}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l4 2 4-2"/><path strokeLinecap="round" strokeLinejoin="round" d="M13 8l4 2 4-2"/><path strokeLinecap="round" strokeLinejoin="round" d="M7 10v6"/><path strokeLinecap="round" strokeLinejoin="round" d="M17 10v6"/><path strokeLinecap="round" strokeLinejoin="round" d="M4 16h6"/><path strokeLinecap="round" strokeLinejoin="round" d="M14 16h6"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 8h8"/><path strokeLinecap="round" strokeLinejoin="round" d="M13 8h8"/></svg>),
  Factory: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:'1em',height:'1em',verticalAlign:'-0.125em'}}><path strokeLinecap="round" strokeLinejoin="round" d="M2 20h20M4 20V8l4-4v16M12 20V6l4-4v18M20 20v-8l-4-4"/></svg>),
  Money: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:'1em',height:'1em',verticalAlign:'-0.125em'}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  Clock: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:'1em',height:'1em',verticalAlign:'-0.125em'}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  CheckCircle: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:'1em',height:'1em',verticalAlign:'-0.125em'}}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  Clipboard: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:'1em',height:'1em',verticalAlign:'-0.125em'}}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>),
  Crown: () => (<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" style={{width:'1em',height:'1em',verticalAlign:'-0.125em'}}><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z"/><path d="M5 18h14v2H5v-2z"/></svg>),
  Medal: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:'1em',height:'1em',verticalAlign:'-0.125em'}}><path d="M12 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M10.8 14.8 9 21l3-1.5 3 1.5-1.8-6.2"/></svg>),
  Handshake: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:'1em',height:'1em',verticalAlign:'-0.125em'}}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5 21 3v6l-4.5 4.5M10.5 13.5 3 21v-6l4.5-4.5M3 3l18 18"/></svg>),
  Formula: () => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:'1em',height:'1em',verticalAlign:'-0.125em'}}><path strokeLinecap="round" strokeLinejoin="round" d="M4 19V5a2 2 0 0 1 2-2h13.4a.6.6 0 0 1 .6.6v13.114"/><path strokeLinecap="round" strokeLinejoin="round" d="M14 10h5M14 14h5M5 10l4 4M9 10l-4 4"/></svg>)
};

/**
 * FactoryAnalysisPage Component
 * CaneSetu Premium Dark Theme
 */

const MOCK_FACTORIES = [
  { id:1, name:'Premium Sugar Mills',      loc:'Maharashtra, India',     score:494.12, price:5000, delay:7.5,  fulfill:84.0,  contracts:25, completed:21, rating:'EXCELLENT', color:'var(--green)',   cssClass:'green-bar' },
  { id:2, name:'Golden Cane Processing',   loc:'Uttar Pradesh, India',   score:287.97, price:4800, delay:12.0, fulfill:77.78, contracts:18, completed:14, rating:'EXCELLENT', color:'var(--amber)',   cssClass:'amber-bar' },
  { id:3, name:'Sweet Valley Industries',  loc:'Karnataka, India',       score:142.86, price:4500, delay:20.0, fulfill:66.67, contracts:12, completed:8,  rating:'GOOD',      color:'var(--blue)',    cssClass:'blue-bar'  },
  { id:4, name:'New Factory',              loc:'Gujarat, India',         score:0.00,   price:0,    delay:30.0, fulfill:0.0,   contracts:0,  completed:0,  rating:'POOR',      color:'var(--red)',     cssClass:'red-bar'   },
  { id:5, name:'Nashik Agro Sugar Co.',    loc:'Nashik, Maharashtra',    score:380.44, price:4900, delay:9.0,  fulfill:80.0,  contracts:30, completed:24, rating:'EXCELLENT', color:'var(--green)',   cssClass:'green-bar' },
  { id:6, name:'Kolhapur Cooperative',     loc:'Kolhapur, Maharashtra',  score:310.11, price:4750, delay:11.5, fulfill:78.5,  contracts:22, completed:17, rating:'EXCELLENT', color:'var(--amber)',   cssClass:'amber-bar' },
  { id:7, name:'Solapur Mills Ltd.',       loc:'Solapur, Maharashtra',   score:220.38, price:4600, delay:16.0, fulfill:70.0,  contracts:15, completed:10, rating:'GOOD',      color:'var(--blue)',    cssClass:'blue-bar'  },
  { id:8, name:'Pune Sugar Works',         loc:'Pune, Maharashtra',      score:190.55, price:4400, delay:18.5, fulfill:68.0,  contracts:10, completed:6,  rating:'GOOD',      color:'var(--blue)',    cssClass:'blue-bar'  },
];

const getScoreParams = (score) => {
  if (score >= 400) return { rating: 'EXCELLENT', color: 'var(--green)', cssClass: 'green-bar' };
  if (score >= 200) return { rating: 'GOOD', color: 'var(--amber)', cssClass: 'amber-bar' };
  if (score >= 100) return { rating: 'AVERAGE', color: 'var(--blue)', cssClass: 'blue-bar' };
  return { rating: 'POOR', color: 'var(--red)', cssClass: 'red-bar' };
};

const FactoryAnalysisPage = () => {
  const [factories, setFactories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Compare State
  const [selA, setSelA] = useState(null);
  const [selB, setSelB] = useState(null);
  const [dropAOpen, setDropAOpen] = useState(false);
  const [dropBOpen, setDropBOpen] = useState(false);
  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');

  useEffect(() => {
    const fetchFactoryAnalysis = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn("No token found. User might not be authenticated.");
          setFactories([]);
          setLoading(false);
          return;
        }

        const response = await axios.get('/api/analytics/factory-profitability', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 
        });

        if (response.data.success && response.data.data && response.data.data.length > 0) {
          const apiFactories = response.data.data;
          // Normalize
          const normalized = apiFactories.map((f, i) => {
            const score = f.profitabilityScore || 0;
            const params = getScoreParams(score);
            return {
              id: f.factoryId || `api-${i}`,
              name: f.factoryName || 'Unknown Factory',
              loc: f.factoryLocation || 'Location unknown',
              price: f.averagePricePerTon || 0,
              delay: f.averagePaymentDelay || 0,
              fulfill: (f.contractFulfillmentRate || 0) * 100,
              contracts: f.totalContracts || 0,
              completed: f.completedContracts || 0,
              score: score,
              rating: params.rating,
              color: params.color,
              cssClass: params.cssClass
            };
          }).sort((a, b) => b.score - a.score); // Default sort desc

          setFactories(normalized);
        } else {
          console.log("No real data found from API. Setting to empty.");
          setFactories([]);
        }
      } catch (err) {
        console.error('Error fetching factory analysis:', err);
        setFactories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFactoryAnalysis();
  }, []);

  // Set initial selections when factories load
  useEffect(() => {
    if (factories.length >= 2 && !selA) {
      setSelA(factories[0]);
      setSelB(factories[1]);
    } else if (factories.length === 1 && !selA) {
      setSelA(factories[0]);
      setSelB(factories[0]);
    }
  }, [factories, selA]);

  // Handle global clicks to close dropdowns
  useEffect(() => {
    const handleGlobalClick = () => {
      setDropAOpen(false);
      setDropBOpen(false);
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  // Compute stats
  const top4ChartFactories = useMemo(() => {
    return [...factories].sort((a, b) => b.score - a.score).slice(0, 4);
  }, [factories]);

  const maxChartScore = useMemo(() => {
    const max = Math.max(...top4ChartFactories.map(f => f.score));
    return max > 500 ? Math.ceil(max / 100) * 100 : 500;
  }, [top4ChartFactories]);

  const avgPrice = useMemo(() => {
    if(!factories.length) return 0;
    const maxP = Math.max(...factories.map(f => f.price));
    return maxP;
  }, [factories]);

  const avgScore = useMemo(() => {
    if(!factories.length) return 0;
    const sum = factories.reduce((acc, f) => acc + f.score, 0);
    return (sum / factories.length).toFixed(1);
  }, [factories]);

  const withContracts = useMemo(() => {
    return factories.filter(f => f.contracts > 0).length;
  }, [factories]);

  const formatCurrency = (amount) => '₹' + amount.toLocaleString('en-IN');
  
  const ratingBadgeClass = (r) => {
    if (r === 'EXCELLENT') return 'fap-rating-excellent';
    if (r === 'GOOD')      return 'fap-rating-good';
    if (r === 'AVERAGE')   return 'fap-rating-average';
    return 'fap-rating-poor';
  };

  const RatingIcon = ({ r }) => {
    if (r === 'EXCELLENT') return (
      <svg viewBox="0 0 16 16" fill="currentColor" style={{width:'0.85em',height:'0.85em',flexShrink:0}}>
        <path d="M8 1l1.85 3.75L14 5.5l-3 2.9.7 4.1L8 10.4l-3.7 2.1.7-4.1-3-2.9 4.15-.75z"/>
      </svg>
    );
    if (r === 'GOOD') return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'0.85em',height:'0.85em',flexShrink:0}}>
        <polyline points="2.5 8 6.5 12 13.5 4"/>
      </svg>
    );
    if (r === 'AVERAGE') return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{width:'0.85em',height:'0.85em',flexShrink:0}}>
        <line x1="3" y1="8" x2="13" y2="8"/>
      </svg>
    );
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{width:'0.85em',height:'0.85em',flexShrink:0}}>
        <line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/>
      </svg>
    );
  };

  const delayBadgeClass = (d) => {
    if (d <= 10) return 'fap-delay-good';
    if (d <= 18) return 'fap-delay-ok';
    return 'fap-delay-bad';
  };

  if (loading) {
    return (
      <div className="fap-page-container">
        <div className="fap-loading-container">
          <div className="fap-loading-spinner" style={{display:'flex',justifyContent:'center',alignItems:'center',width:'40px',height:'40px',color:'var(--green)'}}><Icons.Loader /></div>
          <p>Interfacing with CaneSetu Analytics Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fap-page-container">

      <div className="fap-page-content">
        
        {/* PAGE HERO */}
        <div className="fap-page-hero">
          <div>
            <div className="fap-ph-eyebrow">Farmer Dashboard</div>
            <h1 className="fap-page-title">Factory <em>Profitability</em><br/>Analysis</h1>
            <p className="fap-page-sub">Compare factories on price, payment speed, and fulfillment — find the best partner for your cane this season.</p>
          </div>
          <div style={{textAlign: 'right', paddingTop: '16px'}}>
            <div style={{fontSize:'.68rem',letterSpacing:'.1em',textTransform:'uppercase',color:'var(--muted-2)',marginBottom:'6px'}}>Analysis Date</div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1.1rem',fontWeight:'700',color:'var(--green)'}}>
              {new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})}
            </div>
          </div>
        </div>

        {/* KPI ROW */}
        <div className="fap-hero-kpi-row">
          <div className="fap-kpi-card green">
            <div className="fap-kpi-label">Factories Analysed</div>
            <div className="fap-kpi-val green">{factories.length}</div>
            <div className="fap-kpi-sub">In your region</div>
          </div>
          <div className="fap-kpi-card amber">
            <div className="fap-kpi-label">Average Score</div>
            <div className="fap-kpi-val amber">{avgScore}</div>
            <div className="fap-kpi-sub">Profitability index</div>
          </div>
          <div className="fap-kpi-card blue">
            <div className="fap-kpi-label">With Contracts</div>
            <div className="fap-kpi-val blue">{withContracts}</div>
            <div className="fap-kpi-sub">Active this season</div>
          </div>
          <div className="fap-kpi-card green">
            <div className="fap-kpi-label">Best Avg. Price</div>
            <div className="fap-kpi-val green">{formatCurrency(avgPrice)}</div>
            <div className="fap-kpi-sub">Top Mill</div>
          </div>
        </div>

        {/* CHART SECTION */}
        <div className="fap-section-wrap">
          <div className="fap-section-card">
            <div className="fap-section-card-header">
              <div className="fap-sch-left">
                <div className="fap-sch-icon" style={{fontSize: '1.4rem'}}><Icons.Chart /></div>
                <div>
                  <div className="fap-sch-title">Profitability Score — Bar Chart</div>
                  <div className="fap-sch-sub">Higher = better partner for your cane</div>
                </div>
              </div>
              <div className="fap-chart-legend">
                <div className="fap-cl-item"><div className="fap-cl-dot" style={{background:'var(--green)'}}></div><span className="fap-cl-lbl">Excellent (400+)</span></div>
                <div className="fap-cl-item"><div className="fap-cl-dot" style={{background:'var(--amber)'}}></div><span className="fap-cl-lbl">Good (200–400)</span></div>
                <div className="fap-cl-item"><div className="fap-cl-dot" style={{background:'var(--blue)'}}></div><span className="fap-cl-lbl">Average (100–200)</span></div>
                <div className="fap-cl-item"><div className="fap-cl-dot" style={{background:'var(--red)'}}></div><span className="fap-cl-lbl">Poor (&lt;100)</span></div>
              </div>
            </div>
            <div className="fap-chart-area">
              <div className="fap-chart-canvas-wrap">
                <div className="fap-chart-grid-lines">
                  <div className="fap-cgl"></div><div className="fap-cgl"></div>
                  <div className="fap-cgl"></div><div className="fap-cgl"></div>
                  <div className="fap-cgl"></div>
                </div>
                <div className="fap-chart-y-labels">
                  <span className="fap-cyl">{maxChartScore}</span>
                  <span className="fap-cyl">{maxChartScore * 0.8}</span>
                  <span className="fap-cyl">{maxChartScore * 0.6}</span>
                  <span className="fap-cyl">{maxChartScore * 0.4}</span>
                  <span className="fap-cyl">{maxChartScore * 0.2}</span>
                  <span className="fap-cyl">0</span>
                </div>
                
                <div className="fap-bars-wrap">
                  {top4ChartFactories.map((f, i) => (
                    <div className="fap-bar-col" key={f.id}>
                      <div 
                        className={`fap-bar-fill ${f.cssClass}`} 
                        style={{ height: `calc(${f.score}/${maxChartScore}*100%)`, animationDelay: `${0.1 * (i+1)}s` }}
 

                      >
                        <span className="fap-bar-val" style={f.score === 0 ? {top:'-24px'} : {}}>
                          {f.score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {/* Fill empty slots if < 4 factories */}
                  {Array.from({length: Math.max(0, 4 - top4ChartFactories.length)}).map((_, i) => (
                     <div className="fap-bar-col" key={`empty-${i}`}></div>
                  ))}
                </div>

                <div className="fap-chart-x-axis">
                  {top4ChartFactories.map((f) => (
                    <span key={f.id} className="fap-chart-x-label" title={f.name}>
                      {f.name.substring(0, 15)}{f.name.length > 15 ? '...' : ''}
                    </span>
                  ))}
                   {Array.from({length: Math.max(0, 4 - top4ChartFactories.length)}).map((_, i) => (
                     <span className="fap-chart-x-label" key={`empty-x-${i}`}></span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RANKINGS TABLE */}
        <div className="fap-section-wrap">
          <div className="fap-section-card">
            <div className="fap-section-card-header">
              <div className="fap-sch-left">
                <div className="fap-sch-icon" style={{fontSize: '1.4rem'}}><Icons.Trophy /></div>
                <div>
                  <div className="fap-sch-title">Factory Rankings</div>
                  <div className="fap-sch-sub">Ranked by profitability score — current season</div>
                </div>
              </div>
            </div>
            <div className="fap-rankings-body">
              <table className="fap-rank-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Factory</th>
                    <th>Avg. Price (₹/ton)</th>
                    <th>Payment Delay</th>
                    <th>Fulfillment Rate</th>
                    <th>Score</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {factories.map((f, i) => (
                    <tr 
                      key={f.id} 
                      className={`fap-rank-${i+1}`}
 

                    >
                      <td><span className="fap-rank-num">#{i+1}</span></td>
                      <td>
                        <div className="fap-fn-name">{f.name}</div>
                        <div className="fap-fn-loc"><Icons.Location /> {f.loc}</div>
                        <div className="fap-fn-contracts">{f.contracts} contracts · {f.completed} completed</div>
                        {i === 0 && <div className="fap-recommended-pill"><Icons.Star /> Recommended Factory</div>}
                      </td>
                      <td><span className={`fap-td-num ${f.score > 200 ? f.score > 350 ? 'green':'amber' : 'muted'}`}>{formatCurrency(f.price)}</span></td>
                      <td><span className={`fap-delay-badge ${delayBadgeClass(f.delay)}`}>{f.delay.toFixed(1)} days</span></td>
                      <td>
                        <div className="fap-fulfillment-bar-wrap">
                          <div className="fap-fulfillment-track">
                            <div className="fap-fulfillment-fill" style={{width: `${f.fulfill}%`, background: f.color}}></div>
                          </div>
                          <span className="fap-fulfillment-pct" style={{color: f.color}}>{f.fulfill.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td><span className="fap-td-num" style={{color: f.color}}>{f.score.toFixed(2)}</span></td>
                      <td><span className={`fap-rating-badge ${ratingBadgeClass(f.rating)}`}><RatingIcon r={f.rating} />{f.rating}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* COMPARE SECTION */}
        <div className="fap-section-wrap">
          <div className="fap-compare-section">
            <div className="fap-compare-header">
              <div className="fap-sch-left">
                <div className="fap-sch-icon" style={{fontSize: '1.4rem'}}><Icons.Scale /></div>
                <div>
                  <div className="fap-sch-title">Head-to-Head Comparison</div>
                  <div className="fap-sch-sub">Select any two factories from the database to compare side-by-side</div>
                </div>
              </div>
              <div style={{fontSize:'.72rem',color:'var(--muted-2)',background:'rgba(126,200,67,.06)',border:'1px solid rgba(126,200,67,.15)',borderRadius:'100px',padding:'6px 14px',display:'flex',alignItems:'center',gap:'6px'}}>
                <Icons.Factory /> {factories.length} factories in database
              </div>
            </div>

            {/* SELECTORS */}
            <div className="fap-compare-selectors">
              {/* FACTORY A */}
              <div className="fap-factory-selector">
                <div className="fap-fs-label">Factory A</div>
                <div style={{position:'relative'}}>
                  <button 
                    className="fap-factory-select-btn selected" 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setDropAOpen(!dropAOpen); setDropBOpen(false); }}
 

                  >
                    <div className="fap-fsb-inner">
                      <div className="fap-fsb-avatar" style={{background:'rgba(126,200,67,.1)',color:'var(--green)',display:'flex',justifyContent:'center',alignItems:'center',fontSize:'1.2rem'}}><Icons.Factory /></div>
                      <div className="fap-fsb-info">
                        <div className="fap-fsb-name">{selA?.name || 'Select Factory'}</div>
                        <div className="fap-fsb-detail">{selA?.loc || '---'} · Score: {selA?.score?.toFixed(2)}</div>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{color:'var(--muted-2)',flexShrink:0}}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                    </div>
                  </button>
                  {dropAOpen && (
                    <div className="fap-factory-dropdown" onClick={e => e.stopPropagation()}>
                      <div className="fap-fd-search">
                        <input 
                          type="text" 
                          placeholder="Search factories…" 
                          onChange={(e) => setSearchA(e.target.value)}
 

                        />
                      </div>
                      <div>
                        {factories.filter(f => f.name.toLowerCase().includes(searchA.toLowerCase())).map(f => (
                          <div 
                            key={f.id}
                            className={`fap-fd-option ${selA?.id === f.id ? 'active-sel' : ''}`}
                            onClick={() => { setSelA(f); setDropAOpen(false); setSearchA(''); }}
 

                          >
                            <div className="fap-fdo-avatar" style={{background: `${f.color}22`,color:f.color,display:'flex',justifyContent:'center',alignItems:'center',fontSize:'1.1rem'}}><Icons.Factory /></div>
                            <div>
                              <div className="fap-fdo-name">{f.name}</div>
                              <div className="fap-fdo-detail">{f.loc} · {f.contracts} contracts</div>
                            </div>
                            <div className="fap-fdo-score">{f.score.toFixed(1)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="fap-vs-badge">VS</div>

              {/* FACTORY B */}
              <div className="fap-factory-selector">
                <div className="fap-fs-label">Factory B</div>
                <div style={{position:'relative'}}>
                  <button 
                    className="fap-factory-select-btn selected" 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setDropBOpen(!dropBOpen); setDropAOpen(false); }}
 

                  >
                    <div className="fap-fsb-inner">
                      <div className="fap-fsb-avatar" style={{background:'rgba(232,168,58,.1)',color:'var(--amber)',display:'flex',justifyContent:'center',alignItems:'center',fontSize:'1.2rem'}}><Icons.Factory /></div>
                      <div className="fap-fsb-info">
                        <div className="fap-fsb-name">{selB?.name || 'Select Factory'}</div>
                        <div className="fap-fsb-detail">{selB?.loc || '---'} · Score: {selB?.score?.toFixed(2)}</div>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{color:'var(--muted-2)',flexShrink:0}}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                    </div>
                  </button>
                  {dropBOpen && (
                    <div className="fap-factory-dropdown" onClick={e => e.stopPropagation()}>
                      <div className="fap-fd-search">
                        <input 
                          type="text" 
                          placeholder="Search factories…" 
                          onChange={(e) => setSearchB(e.target.value)}
 

                        />
                      </div>
                      <div>
                        {factories.filter(f => f.name.toLowerCase().includes(searchB.toLowerCase())).map(f => (
                          <div 
                            key={f.id}
                            className={`fap-fd-option ${selB?.id === f.id ? 'active-sel' : ''}`}
                            onClick={() => { setSelB(f); setDropBOpen(false); setSearchB(''); }}
 

                          >
                            <div className="fap-fdo-avatar" style={{background: `${f.color}22`,color:f.color,display:'flex',justifyContent:'center',alignItems:'center',fontSize:'1.1rem'}}><Icons.Factory /></div>
                            <div>
                              <div className="fap-fdo-name">{f.name}</div>
                              <div className="fap-fdo-detail">{f.loc} · {f.contracts} contracts</div>
                            </div>
                            <div className="fap-fdo-score">{f.score.toFixed(1)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RESULTS GRID */}
            <div className="fap-compare-results">
              {selA && selB && (
                <>
                  <div className="fap-compare-grid">
                    <div className="fap-cg-header">Metric</div>
                    <div className="fap-cg-header" style={{paddingLeft:'20px',color:'var(--green)'}}>{selA.name}</div>
                    <div className="fap-cg-header" style={{paddingLeft:'20px',color:'var(--amber)'}}>{selB.name}</div>

                    {/* Metric Rows */}
                    {[
                      { l: <><Icons.Location /> Location</>, va: selA.loc, vb: selB.loc, wa: false, wb: false },
                      { l: <><Icons.Money /> Avg. Price / Ton</>, va: formatCurrency(selA.price), vb: formatCurrency(selB.price), wa: selA.price > selB.price, wb: selB.price > selA.price },
                      { l: <><Icons.Clock /> Payment Delay</>, va: selA.delay + ' days', vb: selB.delay + ' days', wa: selA.delay < selB.delay, wb: selB.delay < selA.delay },
                      { l: <><Icons.CheckCircle /> Fulfillment Rate</>, va: selA.fulfill.toFixed(1) + '%', vb: selB.fulfill.toFixed(1) + '%', wa: selA.fulfill > selB.fulfill, wb: selB.fulfill > selA.fulfill },
                      { l: <><Icons.Clipboard /> Total Contracts</>, va: `${selA.contracts} (${selA.completed} done)`, vb: `${selB.contracts} (${selB.completed} done)`, wa: selA.contracts > selB.contracts, wb: selB.contracts > selA.contracts },
                      { l: <><Icons.Chart /> Score</>, va: selA.score.toFixed(2), vb: selB.score.toFixed(2), wa: selA.score > selB.score, wb: selB.score > selA.score },
                    ].map((row, idx) => (
                      <React.Fragment key={idx}>
                        <div className="fap-cg-metric">{row.l}</div>
                        <div className={`fap-cg-val ${row.wa ? 'winner' : ''}`}>
                          <span className="fap-cg-num" style={{color: row.wa ? 'var(--green)' : 'var(--white)'}}>{row.va}</span>
                          <span className="fap-winner-crown" style={{opacity: row.wa ? 1 : 0}}><Icons.Crown /></span>
                        </div>
                        <div className={`fap-cg-val ${row.wb ? 'winner' : ''}`}>
                          <span className="fap-cg-num" style={{color: row.wb ? 'var(--amber)' : 'var(--white)'}}>{row.vb}</span>
                          <span className="fap-winner-crown" style={{opacity: row.wb ? 1 : 0}}><Icons.Crown /></span>
                        </div>
                      </React.Fragment>
                    ))}

                    <div className="fap-cg-metric"><Icons.Medal /> Rating</div>
                    <div className="fap-cg-val">
                      <span className={`fap-rating-badge ${ratingBadgeClass(selA.rating)}`}><RatingIcon r={selA.rating} />{selA.rating}</span>
                    </div>
                    <div className="fap-cg-val">
                      <span className={`fap-rating-badge ${ratingBadgeClass(selB.rating)}`}><RatingIcon r={selB.rating} />{selB.rating}</span>
                    </div>
                  </div>

                  {/* Verdict */}
                  {selA.score !== selB.score ? (
                    <div className="fap-verdict-banner">
                      <div className="fap-verdict-icon" style={{fontSize:'2rem'}}><Icons.Trophy /></div>
                      <div className="fap-verdict-text">
                        <div className="fap-vt-label">Our Recommendation</div>
                        <div className="fap-vt-main">{(selA.score > selB.score ? selA.name : selB.name)} is the better choice</div>
                        <div className="fap-vt-sub" style={{display:'flex',gap:'8px',flexWrap:'wrap',alignItems:'center'}}>
                          <span style={{color:'var(--white)',fontWeight:'600'}}>Scores {Math.abs(selA.score - selB.score).toFixed(1)} points higher</span>
                          <span style={{color:'var(--muted)'}}>•</span>
                          <span><Icons.Location /> {(selA.score > selB.score ? selA : selB).loc}</span>
                          <span style={{color:'var(--muted)'}}>•</span>
                          <span><Icons.CheckCircle /> {(selA.score > selB.score ? selA : selB).fulfill.toFixed(0)}% fulfillment</span>
                          <span style={{color:'var(--muted)'}}>•</span>
                          <span><Icons.Money /> {formatCurrency((selA.score > selB.score ? selA : selB).price)}/ton</span>
                          <span style={{color:'var(--muted)'}}>•</span>
                          <span><Icons.Clock /> Pays in {(selA.score > selB.score ? selA : selB).delay} days</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="fap-verdict-banner">
                      <div className="fap-verdict-icon"><Icons.Handshake /></div>
                      <div className="fap-verdict-text">
                        <div className="fap-vt-label">Verdict</div>
                        <div className="fap-vt-main">Both factories are evenly matched</div>
                        <div className="fap-vt-sub">Consider proximity to your farm and personal relationship with the factory agent.</div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* FORMULA */}
        <div className="fap-formula-card">
          <div className="fap-formula-icon" style={{fontSize:'1.8rem'}}><Icons.Formula /></div>
          <div>
            <div className="fap-formula-label">Profitability Score Formula</div>
            <div className="fap-formula-eq">
              Score = <span className="fap-eq-green">(Avg. Price/ton × Fulfillment Rate)</span> + <span className="fap-eq-amber">(Avg. Payment Delay + 1)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FactoryAnalysisPage;
