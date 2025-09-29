'use client';
import { useState, useEffect } from 'react';
import { Send, Loader2, TrendingUp, Coins, AlertTriangle, RefreshCw } from 'lucide-react';

interface Analysis {
  tvl: number;
  balances: { DFUND: number; DGOV: number; tDUST: number };
  stablecoinRatio: string;
  concentrationRisk: string;
  riskScore: number;
  recommendation: string;
  aiAnalysis: string;
  walletAddress: string;
  lastUpdated: string;
}

export default function Dashboard() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [messages, setMessages] = useState<Array<{role: 'user'|'agent', text: string}>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalysis = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/treasury-analysis');
      const data = await res.json();
      if (data.success) {
        setAnalysis(data.data);
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !analysis) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/treasury-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMsg,
          context: analysis 
        })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        role: 'agent', 
        text: data.response || 'Error generating response' 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'agent', 
        text: 'Error: Could not reach AI assistant' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Foresight Treasury Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Midnight Blockchain Treasury Analysis
            </p>
          </div>
          <button 
            onClick={fetchAnalysis}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">Refresh</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Treasury Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg p-6 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <Coins className="h-5 w-5 text-cyan-400" />
              <h3 className="text-sm font-medium text-cyan-400">Total Value Locked</h3>
            </div>
            <p className="text-3xl font-bold">{analysis?.tvl || '...'}</p>
            <p className="text-sm text-slate-400 mt-1">tokens</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6 hover:border-blue-500/40 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <h3 className="text-sm font-medium text-blue-400">Stablecoin Ratio</h3>
            </div>
            <p className="text-3xl font-bold">{analysis?.stablecoinRatio || '...'}%</p>
            <p className="text-sm text-slate-400 mt-1">Target: 40-60%</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6 hover:border-purple-500/40 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-5 w-5 text-purple-400" />
              <h3 className="text-sm font-medium text-purple-400">Risk Score</h3>
            </div>
            <p className="text-3xl font-bold">{analysis?.riskScore || '...'}/10</p>
            <p className={`text-sm mt-1 ${
              (analysis?.riskScore || 0) > 5 ? 'text-red-400' : 'text-green-400'
            }`}>
              {analysis?.recommendation || '...'}
            </p>
          </div>
        </div>

        {/* Token Balances */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Token Balances</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-cyan-500/30 transition-colors">
              <p className="text-sm text-slate-400 mb-2">DFUND (Stablecoin)</p>
              <p className="text-2xl font-bold text-cyan-400">{analysis?.balances.DFUND || 0}</p>
              <p className="text-xs text-slate-500 mt-1">
                {analysis ? `${((analysis.balances.DFUND / analysis.tvl) * 100).toFixed(1)}% of treasury` : ''}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-blue-500/30 transition-colors">
              <p className="text-sm text-slate-400 mb-2">DGOV (Governance)</p>
              <p className="text-2xl font-bold text-blue-400">{analysis?.balances.DGOV || 0}</p>
              <p className="text-xs text-slate-500 mt-1">
                {analysis ? `${((analysis.balances.DGOV / analysis.tvl) * 100).toFixed(1)}% of treasury` : ''}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-purple-500/30 transition-colors">
              <p className="text-sm text-slate-400 mb-2">tDUST (Native)</p>
              <p className="text-2xl font-bold text-purple-400">{analysis?.balances.tDUST || 0}</p>
              <p className="text-xs text-slate-500 mt-1">
                {analysis ? `${((analysis.balances.tDUST / analysis.tvl) * 100).toFixed(1)}% of treasury` : ''}
              </p>
            </div>
          </div>
          {analysis?.walletAddress && (
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <p className="text-xs text-slate-500">
                Wallet: <span className="text-cyan-400 font-mono">{analysis.walletAddress}</span>
              </p>
              {analysis?.lastUpdated && (
                <p className="text-xs text-slate-500 mt-1">
                  Last updated: {new Date(analysis.lastUpdated).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* AI Analysis Section */}
        {analysis?.aiAnalysis && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-cyan-400">🤖</span> AI Treasury Analysis
            </h2>
            <div className="whitespace-pre-wrap text-slate-300 leading-relaxed">
              {analysis.aiAnalysis}
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
          <div className="border-b border-slate-800 p-4 bg-slate-800/30">
            <h2 className="text-xl font-semibold">Ask Treasury Assistant</h2>
            <p className="text-sm text-slate-400 mt-1">
              Get answers about risk, rebalancing, or specific tokens
            </p>
          </div>

          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-slate-500 py-12">
                <p className="mb-4">💬 Try asking:</p>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-400">"What are the risks?"</p>
                  <p className="text-slate-400">"How do I rebalance?"</p>
                  <p className="text-slate-400">"Tell me about DGOV concentration"</p>
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-2xl rounded-lg p-4 ${
                  msg.role === 'user' 
                    ? 'bg-cyan-600 text-white shadow-lg' 
                    : 'bg-slate-800 border border-cyan-500/20 shadow-lg'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-cyan-400">
                <Loader2 className="animate-spin h-4 w-4" />
                <span>Analyzing treasury data...</span>
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 p-4 bg-slate-800/30">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask about rebalancing, risk, or recommendations..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                disabled={!analysis || loading}
              />
              <button 
                onClick={sendMessage} 
                disabled={!analysis || loading || !input.trim()}
                className="bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-cyan-500/20"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}