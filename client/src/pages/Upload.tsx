import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { dataEngineerApi } from "@/lib/api";
import { CloudUpload, FileText, Settings, CheckCircle, AlertCircle, Brain, Zap } from "lucide-react";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [mediaOwner, setMediaOwner] = useState("");
  const [notes, setNotes] = useState("");
  const [aiProvider, setAiProvider] = useState("anthropic");
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await dataEngineerApi.uploadFile(formData);
    },
    onSuccess: (data) => {
      toast({
        title: "Upload Successful",
        description: `Successfully extracted ${data.results} rate card entries`,
      });
      // Reset form
      setFile(null);
      setMediaOwner("");
      setNotes("");
      setAiProvider("anthropic");
      // Refresh jobs list
      queryClient.invalidateQueries({ queryKey: ['/api/data-engineer/jobs'] });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const validateFile = (file: File) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Only PDF, DOC, and DOCX files are allowed",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "File size must be less than 50MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    if (!mediaOwner.trim()) {
      toast({
        title: "Media Owner Required",
        description: "Please enter the media owner name",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('mediaOwner', mediaOwner);
    formData.append('notes', notes);
    formData.append('aiProvider', aiProvider);

    uploadMutation.mutate(formData);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return <FileText className={`w-6 h-6 ${ext === 'pdf' ? 'text-red-500' : 'text-blue-500'}`} />;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Upload Card */}
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CloudUpload className="w-8 h-8 text-gray-400" />
          </div>
          <CardTitle>Upload Rate Card Document</CardTitle>
          <p className="text-gray-600">Supports PDF, DOC, and DOCX files up to 50MB</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                dragActive
                  ? 'border-primary bg-blue-50'
                  : file
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 hover:border-primary'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              {file ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    {getFileIcon(file.name)}
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">{file.name}</p>
                    <p className="text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div className="flex items-center justify-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="text-sm">File ready for processing</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <CloudUpload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">Drop your file here</p>
                    <p className="text-gray-600 mb-4">or click to browse</p>
                    <Button type="button" variant="outline">
                      Select File
                    </Button>
                  </div>
                </div>
              )}
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
              />
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="mediaOwner">Media Owner *</Label>
                <Input
                  id="mediaOwner"
                  type="text"
                  placeholder="Enter media owner name"
                  value={mediaOwner}
                  onChange={(e) => setMediaOwner(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="aiProvider">AI Processing Engine</Label>
                <Select value={aiProvider} onValueChange={setAiProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select AI provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anthropic">
                      <div className="flex items-center">
                        <Brain className="w-4 h-4 mr-2" />
                        Anthropic Claude Sonnet 4 - Advanced document analysis
                      </div>
                    </SelectItem>
                    <SelectItem value="openai">
                      <div className="flex items-center">
                        <Zap className="w-4 h-4 mr-2" />
                        OpenAI GPT-4o - Fast structured extraction
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Processing Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any special processing instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-blue-700"
                disabled={uploadMutation.isPending || !file || !mediaOwner.trim()}
              >
                {uploadMutation.isPending ? (
                  <>
                    <Settings className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    Start Processing
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Processing Status */}
      {uploadMutation.isPending && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-4"></div>
              <div>
                <h4 className="text-lg font-medium text-gray-900">Processing Document</h4>
                <p className="text-gray-600">Extracting rate card information...</p>
              </div>
            </div>
            <div className="space-y-2">
              <Progress value={65} className="w-full" />
              <p className="text-sm text-gray-600">AI text analysis in progress...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Ensure your document contains rate card information with pricing details</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Clear, readable text will improve extraction accuracy</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Processing typically takes 1-3 minutes depending on document size</span>
            </div>
            <div className="flex items-start">
              <AlertCircle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>Scanned documents may require higher processing time</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
