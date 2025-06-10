import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { dataEngineerApi } from "@/lib/api";
import { 
  FileText, 
  Loader, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Download,
  RotateCcw,
  Trash2,
  RefreshCw,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

export default function Jobs() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const { data: jobs, isLoading, refetch } = useQuery({
    queryKey: ['/api/data-engineer/jobs'],
    queryFn: () => dataEngineerApi.getJobs(),
  });

  const filteredJobs = jobs?.filter((job: any) => 
    statusFilter === "all" || job.status === statusFilter
  ) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return <FileText className={`w-6 h-6 ${ext === 'pdf' ? 'text-red-500' : 'text-blue-500'}`} />;
  };

  const handleExport = async (jobId: number) => {
    try {
      const blob = await dataEngineerApi.exportJob(jobId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'rate_card_results.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Results have been exported to CSV",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export results",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Jobs Refreshed",
      description: "Job list has been updated",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Processing Jobs</h3>
          <p className="text-gray-600">Manage and monitor your rate card processing jobs</p>
        </div>
        <div className="flex space-x-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Found</h3>
            <p className="text-gray-500">
              {statusFilter === "all" 
                ? "No processing jobs have been created yet" 
                : `No jobs with ${statusFilter} status found`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredJobs.map((job: any) => (
            <Card key={job.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center flex-1 min-w-0">
                    {getFileIcon(job.fileName)}
                    <div className="ml-3 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{job.fileName}</h4>
                      <p className="text-sm text-gray-500">{job.mediaOwner}</p>
                    </div>
                  </div>
                  {getStatusBadge(job.status)}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress:</span>
                    <span className="font-medium">{job.progress || 0}%</span>
                  </div>
                  
                  <Progress 
                    value={job.progress || 0} 
                    className={`w-full ${job.status === 'failed' ? 'bg-red-100' : ''}`}
                  />

                  {job.status === 'completed' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Entries Found:</span>
                      <span className="font-medium text-green-600">
                        {job.resultData?.length || 0}
                      </span>
                    </div>
                  )}

                  {job.status === 'failed' && job.errorMessage && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center mb-1">
                        <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                        <span className="text-sm font-medium text-red-800">Error</span>
                      </div>
                      <p className="text-sm text-red-700">{job.errorMessage}</p>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Created:</span>
                    <div className="flex items-center text-gray-900">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
                  <Button 
                    className="flex-1" 
                    variant="outline" 
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    {job.status === 'processing' ? 'View Progress' : 'View Details'}
                  </Button>
                  
                  {job.status === 'completed' ? (
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700" 
                      size="sm"
                      onClick={() => handleExport(job.id)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  ) : job.status === 'failed' ? (
                    <Button 
                      className="flex-1" 
                      variant="outline" 
                      size="sm"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Retry
                    </Button>
                  ) : (
                    <Button 
                      className="flex-1" 
                      variant="outline" 
                      size="sm"
                      disabled
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
