import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { dataEngineerApi } from "@/lib/api";
import { 
  FileSpreadsheet, 
  Loader, 
  Download,
  Table as TableIcon
} from "lucide-react";
import { useState } from "react";

export default function Results() {
  const [mediaTypeFilter, setMediaTypeFilter] = useState("all");
  const { toast } = useToast();

  const { data: results, isLoading } = useQuery({
    queryKey: ['/api/data-engineer/results'],
    queryFn: () => dataEngineerApi.getResults(),
  });

  const filteredResults = results?.filter((result: any) => 
    mediaTypeFilter === "all" || result.mediaType?.toLowerCase() === mediaTypeFilter
  ) || [];

  const getMediaTypeBadge = (mediaType: string) => {
    const type = mediaType?.toLowerCase();
    const colors = {
      print: "bg-blue-100 text-blue-800",
      digital: "bg-purple-100 text-purple-800",
      radio: "bg-yellow-100 text-yellow-800",
      tv: "bg-red-100 text-red-800",
      television: "bg-red-100 text-red-800",
    };
    
    return (
      <Badge className={colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {mediaType || "Unknown"}
      </Badge>
    );
  };

  const getConfidenceBadge = (confidence: string) => {
    const level = confidence?.toLowerCase();
    const colors = {
      high: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-red-100 text-red-800",
    };
    
    return (
      <Badge className={colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {confidence || "Medium"}
      </Badge>
    );
  };

  const handleExportAll = async () => {
    try {
      const blob = await dataEngineerApi.exportAllResults();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'all_rate_card_results.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "All results have been exported to CSV",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export results",
        variant: "destructive",
      });
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Extracted Results</h3>
          <p className="text-gray-600">View and export rate card data from completed jobs</p>
        </div>
        <div className="flex space-x-3">
          <Select value={mediaTypeFilter} onValueChange={setMediaTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Media Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Media Types</SelectItem>
              <SelectItem value="print">Print</SelectItem>
              <SelectItem value="digital">Digital</SelectItem>
              <SelectItem value="radio">Radio</SelectItem>
              <SelectItem value="tv">Television</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportAll} className="bg-green-600 hover:bg-green-700">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Results Table */}
      <Card>
        <CardContent>
          {filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <TableIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-500">
                {mediaTypeFilter === "all" 
                  ? "No rate card entries have been extracted yet" 
                  : `No results found for ${mediaTypeFilter} media type`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Media Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Format
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Placement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dimensions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Media Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Production
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredResults.map((result: any) => (
                    <tr key={result.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getMediaTypeBadge(result.mediaType)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.mediaFormat || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.placementName || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {result.dimensions || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {result.costMedia4weeks || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {result.productionCost || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {result.totalCost || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getConfidenceBadge(result.confidence)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination would go here if needed */}
      {filteredResults.length > 0 && (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to{" "}
              <span className="font-medium">{Math.min(filteredResults.length, 50)}</span> of{" "}
              <span className="font-medium">{filteredResults.length}</span> results
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
