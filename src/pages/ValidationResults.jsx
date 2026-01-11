import React, { useState } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Copy, Download, Play } from 'lucide-react';

/**
 * Validation Results Page (/editor/results)
 * Reference: IMG_1850.PNG (Deploy Platform mockup)
 *
 * Displays code validation status with success/error/warning states
 * Uses Nurds Code design tokens: Cyan primary, Neon Green success, Orange warnings
 */
export default function ValidationResults() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(mockCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mock validation data
  const mockCode = `import React, { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';

export default function CodeValidator() {
  const [status, setStatus] = useState('valid');

  return (
    <div className="bg-slate-900 p-8 rounded-lg">
      <h1>Code Validation</h1>
      {status === 'valid' && (
        <div className="text-green-500">✓ Code is valid</div>
      )}
    </div>
  );
}`;

  const validationResults = {
    status: 'success',
    message: 'Validation Passed',
    details: 'Code is ready to deploy',
    errors: 0,
    warnings: 1,
    timestamp: new Date().toLocaleString(),
  };

  const warnings = [
    { id: 1, type: 'warning', text: 'Unused variable "oldConfig" on line 42', suggestion: 'Remove unused variable or use it in the code' },
  ];

  const errors = [];

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-[#f5f5f5] pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Validation Results</h1>
          <p className="text-[#b0b0b0]">Code review and deployment readiness check</p>
        </div>

        {/* Status Summary Card */}
        <div
          className={`rounded-lg p-6 border-l-4 ${
            validationResults.status === 'success'
              ? 'bg-[#00FF88]/5 border-[#00FF88]'
              : validationResults.status === 'error'
              ? 'bg-[#FF5459]/5 border-[#FF5459]'
              : 'bg-[#FF9500]/5 border-[#FF9500]'
          }`}
        >
          <div className="flex items-start gap-4">
            {validationResults.status === 'success' ? (
              <CheckCircle size={32} className="text-[#00FF88] flex-shrink-0" />
            ) : validationResults.status === 'error' ? (
              <AlertCircle size={32} className="text-[#FF5459] flex-shrink-0" />
            ) : (
              <AlertTriangle size={32} className="text-[#FF9500] flex-shrink-0" />
            )}

            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-2">
                {validationResults.message}
              </h2>
              <p className="text-[#b0b0b0] mb-4">{validationResults.details}</p>

              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-[#b0b0b0]">Errors:</span>
                  <span
                    className={`font-bold ${
                      validationResults.errors === 0
                        ? 'text-[#00FF88]'
                        : 'text-[#FF5459]'
                    }`}
                  >
                    {validationResults.errors}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#b0b0b0]">Warnings:</span>
                  <span
                    className={`font-bold ${
                      validationResults.warnings === 0
                        ? 'text-[#00FF88]'
                        : 'text-[#FF9500]'
                    }`}
                  >
                    {validationResults.warnings}
                  </span>
                </div>
                <div className="text-[#707070]">
                  {validationResults.timestamp}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Code Display Card */}
        <div className="bg-[#16213e] border border-[rgba(0,240,255,0.2)] rounded-lg overflow-hidden">
          <div className="bg-[#0f3460] px-6 py-4 border-b border-[rgba(0,240,255,0.1)] flex items-center justify-between">
            <span className="text-[#00F0FF] font-semibold font-mono text-sm">dashboard.jsx</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 rounded text-xs bg-[#1a1a2e] text-[#00F0FF] hover:bg-[#00F0FF]/10 border border-[#00F0FF]/30 transition-all"
            >
              <Copy size={14} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <pre className="p-6 overflow-x-auto text-[#b0b0b0] text-sm font-mono leading-relaxed">
            <code>{mockCode}</code>
          </pre>
        </div>

        {/* Warnings Section */}
        {warnings.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#FF9500] flex items-center gap-2">
              <AlertTriangle size={20} />
              Warnings ({warnings.length})
            </h3>

            <div className="space-y-2">
              {warnings.map((warning) => (
                <div
                  key={warning.id}
                  className="bg-[#16213e] border border-[#FF9500]/30 rounded-lg p-4 space-y-2"
                >
                  <p className="text-[#FF9500] font-medium text-sm">{warning.text}</p>
                  <p className="text-[#b0b0b0] text-sm">
                    <span className="text-[#707070]">Suggestion: </span>
                    {warning.suggestion}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Errors Section */}
        {errors.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[#FF5459] flex items-center gap-2">
              <AlertCircle size={20} />
              Errors ({errors.length})
            </h3>

            <div className="space-y-2">
              {errors.map((error) => (
                <div
                  key={error.id}
                  className="bg-[#16213e] border border-[#FF5459]/30 rounded-lg p-4 space-y-2"
                >
                  <p className="text-[#FF5459] font-medium text-sm">{error.text}</p>
                  <p className="text-[#b0b0b0] text-sm">
                    <span className="text-[#707070]">Fix: </span>
                    {error.fix}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t border-[rgba(0,240,255,0.1)]">
          {/* Primary CTA: Deploy */}
          <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#00F0FF] text-[#1a1a2e] font-semibold hover:bg-[#00dae6] transition-all shadow-lg shadow-[rgba(0,240,255,0.2)]">
            <Play size={18} />
            Deploy to Sandbox
          </button>

          {/* Secondary CTA: Run */}
          <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#16213e] text-[#00F0FF] font-semibold border border-[#00F0FF]/30 hover:bg-[#00F0FF]/10 transition-all">
            <Play size={18} />
            Run Locally
          </button>

          {/* Download */}
          <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#16213e] text-[#b0b0b0] font-semibold border border-[rgba(0,240,255,0.2)] hover:text-[#00F0FF] hover:border-[#00F0FF]/50 transition-all">
            <Download size={18} />
            Download
          </button>
        </div>

        {/* Next Steps */}
        <div className="bg-[#16213e] border border-[rgba(0,240,255,0.2)] rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold">Next Steps</h3>

          <div className="space-y-3">
            {validationResults.status === 'success' ? (
              <>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#00FF88] text-[#1a1a2e] flex items-center justify-center font-bold text-sm flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Review the generated code</p>
                    <p className="text-[#b0b0b0] text-sm">Make sure the output matches your requirements</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#00FF88] text-[#1a1a2e] flex items-center justify-center font-bold text-sm flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Test in sandbox environment</p>
                    <p className="text-[#b0b0b0] text-sm">Deploy to your test environment before production</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#00FF88] text-[#1a1a2e] flex items-center justify-center font-bold text-sm flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Deploy to production</p>
                    <p className="text-[#b0b0b0] text-sm">Ready to deploy when you're confident</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FF5459] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    ✕
                  </div>
                  <div>
                    <p className="font-medium">Fix errors first</p>
                    <p className="text-[#b0b0b0] text-sm">Address all errors before deployment</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FF9500] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    ⚠
                  </div>
                  <div>
                    <p className="font-medium">Review warnings</p>
                    <p className="text-[#b0b0b0] text-sm">Consider fixing warnings for better code quality</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
