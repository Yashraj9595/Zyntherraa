import React, { useState } from 'react';
import { Ruler, Save, Plus, Trash2 } from 'lucide-react';

interface SizeChart {
  id: string;
  category: string;
  sizes: {
    size: string;
    chest: string;
    waist: string;
    hip: string;
    length: string;
  }[];
}

export default function SizeGuide() {
  const [sizeCharts, setSizeCharts] = useState<SizeChart[]>([
    {
      id: '1',
      category: 'Women\'s Kurtas',
      sizes: [
        { size: 'XS', chest: '32"', waist: '26"', hip: '34"', length: '42"' },
        { size: 'S', chest: '34"', waist: '28"', hip: '36"', length: '42"' },
        { size: 'M', chest: '36"', waist: '30"', hip: '38"', length: '43"' },
        { size: 'L', chest: '38"', waist: '32"', hip: '40"', length: '43"' },
        { size: 'XL', chest: '40"', waist: '34"', hip: '42"', length: '44"' },
        { size: 'XXL', chest: '42"', waist: '36"', hip: '44"', length: '44"' }
      ]
    },
    {
      id: '2',
      category: 'Men\'s Kurtas',
      sizes: [
        { size: 'S', chest: '38"', waist: '32"', hip: '40"', length: '44"' },
        { size: 'M', chest: '40"', waist: '34"', hip: '42"', length: '45"' },
        { size: 'L', chest: '42"', waist: '36"', hip: '44"', length: '46"' },
        { size: 'XL', chest: '44"', waist: '38"', hip: '46"', length: '47"' },
        { size: 'XXL', chest: '46"', waist: '40"', hip: '48"', length: '48"' }
      ]
    }
  ]);

  const [measurementGuide, setMeasurementGuide] = useState(`How to Measure:

CHEST/BUST:
Measure around the fullest part of your chest/bust, keeping the tape measure horizontal.

WAIST:
Measure around your natural waistline, which is the narrowest part of your torso.

HIP:
Measure around the fullest part of your hips, approximately 8 inches below your waist.

LENGTH:
For kurtas: Measure from the shoulder point down to your desired length.
For bottoms: Measure from waist to ankle.

IMPORTANT TIPS:
• Take measurements over light clothing or undergarments
• Keep the measuring tape snug but not tight
• Stand straight and breathe normally while measuring
• For the best fit, have someone help you measure
• If you're between sizes, we recommend choosing the larger size

SIZE RECOMMENDATIONS:
• For a fitted look: Choose your exact measurements
• For a comfortable fit: Go one size up
• For an oversized look: Go two sizes up

If you need help with sizing, please contact our customer service team.`);

  const [isSaving, setIsSaving] = useState(false);

  const addSizeChart = () => {
    const newChart: SizeChart = {
      id: Date.now().toString(),
      category: '',
      sizes: [
        { size: 'S', chest: '', waist: '', hip: '', length: '' },
        { size: 'M', chest: '', waist: '', hip: '', length: '' },
        { size: 'L', chest: '', waist: '', hip: '', length: '' }
      ]
    };
    setSizeCharts([...sizeCharts, newChart]);
  };

  const removeSizeChart = (id: string) => {
    setSizeCharts(sizeCharts.filter(chart => chart.id !== id));
  };

  const updateChartCategory = (id: string, category: string) => {
    setSizeCharts(sizeCharts.map(chart => 
      chart.id === id ? { ...chart, category } : chart
    ));
  };

  const updateSize = (chartId: string, sizeIndex: number, field: string, value: string) => {
    setSizeCharts(sizeCharts.map(chart => 
      chart.id === chartId 
        ? {
            ...chart,
            sizes: chart.sizes.map((size, index) => 
              index === sizeIndex ? { ...size, [field]: value } : size
            )
          }
        : chart
    ));
  };

  const addSizeToChart = (chartId: string) => {
    setSizeCharts(sizeCharts.map(chart => 
      chart.id === chartId 
        ? {
            ...chart,
            sizes: [...chart.sizes, { size: '', chest: '', waist: '', hip: '', length: '' }]
          }
        : chart
    ));
  };

  const removeSizeFromChart = (chartId: string, sizeIndex: number) => {
    setSizeCharts(sizeCharts.map(chart => 
      chart.id === chartId 
        ? {
            ...chart,
            sizes: chart.sizes.filter((_, index) => index !== sizeIndex)
          }
        : chart
    ));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Size guide saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Measurement Guide */}
      <div>
        <label className="block text-lg font-semibold text-foreground mb-3">
          <Ruler className="inline mr-2" size={20} />
          Measurement Guide
        </label>
        <textarea
          value={measurementGuide}
          onChange={(e) => setMeasurementGuide(e.target.value)}
          rows={20}
          className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
          placeholder="Enter measurement guide instructions..."
        />
      </div>

      {/* Size Charts */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-foreground">Size Charts</h3>
          <button
            onClick={addSizeChart}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            Add Size Chart
          </button>
        </div>

        <div className="space-y-6">
          {sizeCharts.map((chart) => (
            <div key={chart.id} className="border border-border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <input
                  type="text"
                  value={chart.category}
                  onChange={(e) => updateChartCategory(chart.id, e.target.value)}
                  className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
                  placeholder="Enter category name (e.g., Women's Kurtas)"
                />
                <button
                  onClick={() => removeSizeChart(chart.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border px-3 py-2 text-left">Size</th>
                      <th className="border border-border px-3 py-2 text-left">Chest/Bust</th>
                      <th className="border border-border px-3 py-2 text-left">Waist</th>
                      <th className="border border-border px-3 py-2 text-left">Hip</th>
                      <th className="border border-border px-3 py-2 text-left">Length</th>
                      <th className="border border-border px-3 py-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chart.sizes.map((size, index) => (
                      <tr key={index}>
                        <td className="border border-border px-3 py-2">
                          <input
                            type="text"
                            value={size.size}
                            onChange={(e) => updateSize(chart.id, index, 'size', e.target.value)}
                            className="w-full px-2 py-1 border-none bg-transparent focus:outline-none focus:ring-1 focus:ring-primary rounded"
                            placeholder="XS"
                          />
                        </td>
                        <td className="border border-border px-3 py-2">
                          <input
                            type="text"
                            value={size.chest}
                            onChange={(e) => updateSize(chart.id, index, 'chest', e.target.value)}
                            className="w-full px-2 py-1 border-none bg-transparent focus:outline-none focus:ring-1 focus:ring-primary rounded"
                            placeholder='32"'
                          />
                        </td>
                        <td className="border border-border px-3 py-2">
                          <input
                            type="text"
                            value={size.waist}
                            onChange={(e) => updateSize(chart.id, index, 'waist', e.target.value)}
                            className="w-full px-2 py-1 border-none bg-transparent focus:outline-none focus:ring-1 focus:ring-primary rounded"
                            placeholder='26"'
                          />
                        </td>
                        <td className="border border-border px-3 py-2">
                          <input
                            type="text"
                            value={size.hip}
                            onChange={(e) => updateSize(chart.id, index, 'hip', e.target.value)}
                            className="w-full px-2 py-1 border-none bg-transparent focus:outline-none focus:ring-1 focus:ring-primary rounded"
                            placeholder='34"'
                          />
                        </td>
                        <td className="border border-border px-3 py-2">
                          <input
                            type="text"
                            value={size.length}
                            onChange={(e) => updateSize(chart.id, index, 'length', e.target.value)}
                            className="w-full px-2 py-1 border-none bg-transparent focus:outline-none focus:ring-1 focus:ring-primary rounded"
                            placeholder='42"'
                          />
                        </td>
                        <td className="border border-border px-3 py-2 text-center">
                          <button
                            onClick={() => removeSizeFromChart(chart.id, index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3">
                <button
                  onClick={() => addSizeToChart(chart.id)}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
                >
                  <Plus size={14} />
                  Add Size
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-semibold text-purple-900 mb-2">Size Guide Tips</h3>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• Provide clear measurement instructions to reduce returns</li>
          <li>• Include size charts for different product categories</li>
          <li>• Consider adding fit recommendations (fitted, relaxed, oversized)</li>
          <li>• Update size guides based on customer feedback</li>
        </ul>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save size={20} />
          {isSaving ? 'Saving...' : 'Save Size Guide'}
        </button>
      </div>
    </div>
  );
}