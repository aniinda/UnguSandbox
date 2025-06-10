import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { dataEngineerApi } from "@/lib/api";
import { 
  FileText, 
  Loader, 
  CheckCircle, 
  BarChart3,
  Eye,
  Download,
  ArrowUp,
  Clock,
  Brain,
  Zap,
  Settings
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['/api/data-engineer/jobs'],
    queryFn: () => dataEngineerApi.getJobs(),
  });

  const { data: providers } = useQuery({
    queryKey: ['/api/data-engineer/providers'],
    queryFn: () => fetch('/api/data-engineer/providers', {
      headers: { 'Authorization': 'Bearer data_engineer_test_token' }
    }).then(res => res.json()),
  });

  const totalJobs = jobs?.length || 0;
  const processingJobs = jobs?.filter((job: any) => job.status === 'processing').length || 0;
  const completedJobs = jobs?.filter((job: any) => job.status === 'completed').length || 0;
  const recentJobs = jobs?.slice(0, 5) || [];

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
    return <FileText className={`w-5 h-5 ${ext === 'pdf' ? 'text-red-500' : 'text-blue-500'}`} />;
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
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-semibold text-gray-900">{totalJobs}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUp className="w-4 h-4 text-green-500" />
              <span className="text-green-500 ml-1">12%</span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-semibold text-gray-900">{processingJobs}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Loader className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Active processes</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{completedJobs}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-500">
                {totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0}%
              </span>
              <span className="text-gray-500 ml-2">success rate</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Entries Extracted</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {jobs?.reduce((sum: number, job: any) => sum + (job.resultData?.length || 0), 0) || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <ArrowUp className="w-4 h-4 text-green-500" />
              <span className="text-green-500 ml-1">8%</span>
              <span className="text-gray-500 ml-2">this week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Providers Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            AI Processing Engines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers?.map((provider: any) => (
              <div key={provider.id} className="flex items-center p-4 border rounded-lg bg-green-50 border-green-200">
                <div className="flex-shrink-0 mr-3">
                  {provider.id === 'anthropic' ? (
                    <Brain className="w-6 h-6 text-blue-600" />
                  ) : (
                    <Zap className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{provider.name}</h4>
                  <p className="text-sm text-gray-600">{provider.description}</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Available</Badge>
              </div>
            )) || (
              <div className="text-center py-4 text-gray-500">
                Loading AI providers...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Processing Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {recentJobs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No processing jobs found</p>
              <p className="text-sm text-gray-400">Upload a file to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Media Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentJobs.map((job: any) => (
                    <tr key={job.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getFileIcon(job.fileName)}
                          <span className="ml-3 text-sm font-medium text-gray-900">
                            {job.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {job.mediaOwner}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(job.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                            <div
                              className={`h-2 rounded-full ${
                                job.status === 'completed' ? 'bg-green-500' : 
                                job.status === 'processing' ? 'bg-yellow-500' : 'bg-gray-300'
                              }`}
                              style={{ width: `${job.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{job.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2 justify-end">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          {job.status === 'completed' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleExport(job.id)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Export
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
