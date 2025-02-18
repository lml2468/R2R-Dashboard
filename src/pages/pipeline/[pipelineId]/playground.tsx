'use client';
import { useSearchParams } from 'next/navigation';
import { r2rClient } from 'r2r-js';
import React, { useState, useEffect, useRef } from 'react';

import { Result } from '@/components/ChatDemo/result';
import { Search } from '@/components/ChatDemo/search';
import SingleSwitch from '@/components/ChatDemo/SingleSwitch';
import useSwitchManager from '@/components/ChatDemo/SwitchManager';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ModelSelector from '@/components/ui/ModelSelector';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { usePipelineInfo } from '@/context/PipelineInfo';
import { useUserContext } from '@/context/UserContext';

const Index: React.FC = () => {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  useEffect(() => {
    if (searchParams) {
      setQuery(decodeURIComponent(searchParams.get('q') || ''));
    }
  }, [searchParams]);

  const { selectedModel } = useUserContext();
  const [uploadedDocuments, setUploadedDocuments] = useState([]);

  const { pipeline, isLoading: isPipelineLoading } = usePipelineInfo();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('query');

  const { switches, initializeSwitch, updateSwitch } = useSwitchManager();

  const [temperature, setTemperature] = useState(0.1);
  const [topP, setTopP] = useState(1);
  const [top_k, setTop_k] = useState(100);
  const [max_tokens_to_sample, setMax_tokens_to_sample] = useState(1024);
  const [kg_temperature, setKgTemperature] = useState(0.1);
  const [kg_top_p, setKgTopP] = useState(1);
  const [kg_top_k, setKgTop_k] = useState(100);
  const [kg_max_tokens_to_sample, setKgMax_tokens_to_sample] = useState(1024);

  const [graphDimensions, setGraphDimensions] = useState({
    width: 0,
    height: 0,
  });
  const contentAreaRef = useRef<HTMLDivElement>(null);

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    initializeSwitch(
      'vector_search',
      true,
      'Vector Search',
      'Vector search is a search method that uses vectors to represent documents and queries. It is used to find similar documents to a given query.'
    );
    initializeSwitch(
      'hybrid_search',
      false,
      'Hybrid Search',
      'Hybrid search is a search method that combines multiple search methods to provide more accurate and relevant search results.'
    );
  }, [initializeSwitch]);

  const handleSwitchChange = (id: string, checked: boolean) => {
    updateSwitch(id, checked);
    toast({
      title: `${switches[id].label} status changed`,
      description: (
        <pre className="mt-2 mb-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">
            {JSON.stringify({ [id]: checked }, null, 2)}
          </code>
        </pre>
      ),
    });
  };

  useEffect(() => {
    if (pipeline?.deploymentUrl) {
      const client = new r2rClient(pipeline.deploymentUrl);
      setIsLoading(true);
      client
        .documentsOverview()
        .then((documents) => {
          setUploadedDocuments(documents['results']);
        })
        .catch((error) => {
          console.error('Error fetching user documents:', error);
        })
        .finally(() => {
          setIsLoading(false);
          setHasAttemptedFetch(true);
        });
    }
  }, [pipeline?.deploymentUrl]);

  useEffect(() => {
    const updateDimensions = () => {
      if (contentAreaRef.current) {
        setGraphDimensions({
          width: contentAreaRef.current.offsetWidth,
          height: contentAreaRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <Layout pageTitle="Playground" includeFooter={false}>
      <div className="flex h-[calc(100vh)] pt-16">
        {/* Sidebar */}
        <div className="w-80 bg-zinc-800 p-4 flex flex-col overflow-y-auto">
          <h2 className="text-xl font-bold text-blue-500 mb-4">
            Control Panel
          </h2>

          {/* Configuration Fields */}
          <div className="space-y-4 mb-4">
            <h3 className="text-lg font-semibold text-blue-400 mt-2">
              Search Settings
            </h3>

            {/* Switches */}
            <div className="space-y-2 mb-4">
              {Object.keys(switches).map((id) => (
                <SingleSwitch
                  key={id}
                  id={id}
                  initialChecked={switches[id].checked}
                  onChange={handleSwitchChange}
                  label={switches[id].label}
                  tooltipText={switches[id].tooltipText}
                />
              ))}
            </div>
            <h3 className="text-lg font-semibold text-blue-400 pt-4">
              RAG Generation Config
            </h3>
            <div className="space-y-2">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="selectedModel">Selected Model</Label>
                  {/* Model Selector */}
                  <ModelSelector id={selectedModel} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="top_k">Top K</Label>
                  <Input
                    id="top_k"
                    type="number"
                    value={top_k}
                    // className="w-60"
                    onChange={(e) => setTop_k(Number(e.target.value))}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="max_tokens_to_sample">
                    Max Tokens to Sample
                  </Label>
                  <Input
                    id="max_tokens_to_sample"
                    type="number"
                    value={max_tokens_to_sample}
                    // className="w-24"
                    onChange={(e) =>
                      setMax_tokens_to_sample(Number(e.target.value))
                    }
                  />
                </div>

                <Label htmlFor="temperature">Temperature</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="temperature"
                    value={[temperature]}
                    max={2}
                    step={0.01}
                    className="w-60"
                    onValueChange={(value) => setTemperature(value[0])}
                  />
                  <span className="text-sm">{temperature.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="top_p">Top P</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="top_p"
                    value={[topP]}
                    max={1}
                    step={0.01}
                    className="w-60"
                    onValueChange={(value) => setTopP(value[0])}
                  />
                  <span className="text-sm">{topP.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            {/* Pipeline URL */}
            Pipeline URL:
            <input
              type="text"
              value={pipeline?.deploymentUrl || ''}
              disabled={true}
              className="w-full bg-zinc-700 text-zinc-300 p-2 rounded"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center overflow-hidden">
          <div className="w-full max-w-4xl flex flex-col flex-grow overflow-hidden">
            {/* Chat Interface */}
            <div className="flex-1 overflow-auto p-4 mt-5">
              <Result
                query={query}
                setQuery={setQuery}
                model={selectedModel}
                userId={userId}
                apiUrl={pipeline?.deploymentUrl}
                search_limit={10}
                rag_temperature={temperature}
                rag_topP={topP}
                rag_topK={top_k}
                rag_maxTokensToSample={max_tokens_to_sample}
                uploadedDocuments={uploadedDocuments}
                setUploadedDocuments={setUploadedDocuments}
                switches={switches}
                hasAttemptedFetch={hasAttemptedFetch}
              />
            </div>

            {/* Search Bar */}
            <div className="p-4 bg-zinc-800 w-full">
              <Search pipeline={pipeline || undefined} setQuery={setQuery} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
