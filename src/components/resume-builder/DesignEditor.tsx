'use client';

import React, { useState } from 'react';
import { 
  Palette, 
  Minus
} from 'lucide-react';
import { ResumeData } from './types';

interface DesignEditorProps {
  data: ResumeData;
  updateDesign: (key: keyof ResumeData['design'], value: any) => void;
  updateContent: (path: string, value: any) => void;
  selectedSectionId?: string;
  setSelectedSectionId?: (id?: string) => void;
}

export default function DesignEditor({ 
  data, 
  updateDesign, 
  updateContent, 
  selectedSectionId,
  setSelectedSectionId 
}: DesignEditorProps) {
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-8 flex flex-col items-center justify-center h-full">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Palette className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Choose Your Template Style</h2>
            <p className="text-gray-600 mb-8">
              Browse our collection of professional resume templates and find the perfect style for your career
            </p>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Apply Template
            </button>
          </div>
        </div>
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Choose Template</h3>
                  <p className="text-sm text-gray-600">Select a professional template for your resume</p>
                </div>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Minus className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Template Grid */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-3 gap-6">
                {/* Template 1 */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-500 transition-colors cursor-pointer">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 mb-3 h-40">
                    <div className="bg-white rounded p-2 h-full">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-1"></div>
                        <div className="h-1 bg-blue-200 w-3/4 mx-auto mb-1"></div>
                        <div className="h-0.5 bg-gray-300 w-1/2 mx-auto"></div>
                      </div>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-800">Professional</h4>
                  <p className="text-sm text-gray-600">Clean and modern design</p>
                </div>

                {/* Template 2 */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-500 transition-colors cursor-pointer">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 mb-3 h-40">
                    <div className="bg-white rounded p-2 h-full">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-1"></div>
                        <div className="h-1 bg-green-200 w-3/4 mx-auto mb-1"></div>
                        <div className="h-0.5 bg-gray-300 w-1/2 mx-auto"></div>
                      </div>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-800">Modern</h4>
                  <p className="text-sm text-gray-600">Contemporary layout</p>
                </div>

                {/* Template 3 */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-500 transition-colors cursor-pointer">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 mb-3 h-40">
                    <div className="bg-white rounded p-2 h-full">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-purple-500 rounded-full mx-auto mb-1"></div>
                        <div className="h-1 bg-purple-200 w-3/4 mx-auto mb-1"></div>
                        <div className="h-0.5 bg-gray-300 w-1/2 mx-auto"></div>
                      </div>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-800">Creative</h4>
                  <p className="text-sm text-gray-600">Bold and artistic</p>
                </div>

                {/* Template 4 */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-500 transition-colors cursor-pointer">
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 mb-3 h-40">
                    <div className="bg-white rounded p-2 h-full">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-1"></div>
                        <div className="h-1 bg-red-200 w-3/4 mx-auto mb-1"></div>
                        <div className="h-0.5 bg-gray-300 w-1/2 mx-auto"></div>
                      </div>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-800">Executive</h4>
                  <p className="text-sm text-gray-600">Corporate style</p>
                </div>

                {/* Template 5 */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-500 transition-colors cursor-pointer">
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 mb-3 h-40">
                    <div className="bg-white rounded p-2 h-full">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full mx-auto mb-1"></div>
                        <div className="h-1 bg-yellow-200 w-3/4 mx-auto mb-1"></div>
                        <div className="h-0.5 bg-gray-300 w-1/2 mx-auto"></div>
                      </div>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-800">Minimal</h4>
                  <p className="text-sm text-gray-600">Simple and clean</p>
                </div>

                {/* Template 6 */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-500 transition-colors cursor-pointer">
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 mb-3 h-40">
                    <div className="bg-white rounded p-2 h-full">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-indigo-500 rounded-full mx-auto mb-1"></div>
                        <div className="h-1 bg-indigo-200 w-3/4 mx-auto mb-1"></div>
                        <div className="h-0.5 bg-gray-300 w-1/2 mx-auto"></div>
                      </div>
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-800">Academic</h4>
                  <p className="text-sm text-gray-600">Scholarly format</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Apply Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
