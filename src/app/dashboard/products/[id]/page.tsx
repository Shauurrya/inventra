"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Factory, Edit } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatINR, formatNumber } from "@/lib/utils";

export default function ProductDetailPage() {
    const params = useParams();
    const productId = params.id as string;
    const queryClient = useQueryClient();
    const [bomOpen, setBomOpen] = useState(false);
    const [bomData, setBomData] = useState({ rawMaterialId: "", quantityRequired: 0 });

    const { data: product, isLoading } = useQuery({
        queryKey: ["product", productId],
        queryFn: async () => {
            const res = await fetch(`/api/finished-products/${productId}`);
            return res.json();
        },
    });

    const { data: materials = [] } = useQuery({
        queryKey: ["raw-materials"],
        queryFn: async () => {
            const res = await fetch("/api/raw-materials");
            return res.json();
        },
    });

    const { data: productionHistory } = useQuery({
        queryKey: ["production-history", productId],
        queryFn: async () => {
            const res = await fetch(`/api/production?productId=${productId}&limit=10`);
            return res.json();
        },
    });

    const addBomMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/bom", {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["product", productId] });
            toast.success("BOM line added");
            setBomOpen(false);
            setBomData({ rawMaterialId: "", quantityRequired: 0 });
        },
        onError: (e: any) => toast.error(e.message),
    });

    const deleteBomMutation = useMutation({
        mutationFn: async (bomId: string) => {
            const res = await fetch(`/api/bom/${bomId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["product", productId] });
            toast.success("BOM line removed");
        },
    });

    if (isLoading) {
        return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-800 rounded-full animate-spin"></div></div>;
    }

    const costToProduce = product?.billOfMaterials?.reduce((sum: number, bom: any) => {
        return sum + Number(bom.quantityRequired) * Number(bom.rawMaterial.costPerUnit);
    }, 0) || 0;

    return (
        <div className="space-y-6 animate-fade-in">
            <Link href="/dashboard/products" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-800 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Products
            </Link>

            {/* Product Header */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-primary-900">{product?.name}</h1>
                            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                                {product?.sku && <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{product.sku}</span>}
                                <span>Selling Price: <span className="font-semibold text-primary-900">{formatINR(product?.sellingPrice)}</span></span>
                                <span>Stock: <span className="font-semibold text-primary-900">{Number(product?.quantityInStock)} units</span></span>
                            </div>
                            {product?.description && <p className="text-sm text-gray-500 mt-2">{product.description}</p>}
                        </div>
                        <Link href="/dashboard/production">
                            <Button variant="accent">
                                <Factory className="w-4 h-4 mr-2" /> Record Production
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* BOM Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Bill of Materials</CardTitle>
                            <p className="text-sm text-gray-500 mt-1">Defines what raw materials are consumed to produce 1 unit of {product?.name}</p>
                        </div>
                        <Button variant="accent" size="sm" onClick={() => setBomOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" /> Add Line
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {product?.billOfMaterials?.length === 0 ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                            ⚠️ No BOM defined. Add raw materials to this product&apos;s BOM to enable automatic inventory deduction during production.
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50">
                                        <TableHead>Material</TableHead>
                                        <TableHead className="text-right">Qty Required</TableHead>
                                        <TableHead>Unit</TableHead>
                                        <TableHead className="text-right">Current Stock</TableHead>
                                        <TableHead className="text-right">Cost Contribution</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {product?.billOfMaterials?.map((bom: any) => (
                                        <TableRow key={bom.id}>
                                            <TableCell className="font-medium">{bom.rawMaterial.name}</TableCell>
                                            <TableCell className="text-right font-mono">{Number(bom.quantityRequired)}</TableCell>
                                            <TableCell className="text-gray-500">{bom.rawMaterial.unit}</TableCell>
                                            <TableCell className="text-right font-mono">{formatNumber(bom.rawMaterial.quantityInStock)}</TableCell>
                                            <TableCell className="text-right">{formatINR(Number(bom.quantityRequired) * Number(bom.rawMaterial.costPerUnit))}</TableCell>
                                            <TableCell>
                                                <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => deleteBomMutation.mutate(bom.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="mt-4 p-3 bg-primary-50 rounded-lg flex items-center justify-between">
                                <span className="text-sm font-medium text-primary-800">Cost to Produce 1 Unit</span>
                                <span className="text-lg font-bold text-primary-900">{formatINR(costToProduce)}</span>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Production History */}
            <Card>
                <CardHeader><CardTitle className="text-lg">Recent Production History</CardTitle></CardHeader>
                <CardContent>
                    {productionHistory?.entries?.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50">
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Qty Produced</TableHead>
                                    <TableHead>Recorded By</TableHead>
                                    <TableHead>Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {productionHistory.entries.map((entry: any) => (
                                    <TableRow key={entry.id}>
                                        <TableCell>{new Date(entry.productionDate).toLocaleDateString("en-IN")}</TableCell>
                                        <TableCell className="text-right font-mono">{Number(entry.quantityProduced)}</TableCell>
                                        <TableCell className="text-gray-500">{entry.user.name}</TableCell>
                                        <TableCell className="text-gray-500 text-sm">{entry.notes || "—"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-center py-8 text-gray-400 text-sm">No production history for this product</p>
                    )}
                </CardContent>
            </Card>

            {/* Add BOM Dialog */}
            <Dialog open={bomOpen} onOpenChange={setBomOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Add BOM Line Item</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Raw Material</Label>
                            <Select value={bomData.rawMaterialId} onValueChange={(v) => setBomData({ ...bomData, rawMaterialId: v })}>
                                <SelectTrigger className="mt-1"><SelectValue placeholder="Select material" /></SelectTrigger>
                                <SelectContent>
                                    {materials.map((m: any) => (
                                        <SelectItem key={m.id} value={m.id}>{m.name} ({m.unit})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Quantity Required per Unit</Label>
                            <Input type="number" min="0.01" step="0.01" className="mt-1" value={bomData.quantityRequired || ""} onChange={(e) => setBomData({ ...bomData, quantityRequired: Number(e.target.value) })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="accent" onClick={() => addBomMutation.mutate({ finishedProductId: productId, ...bomData })} disabled={addBomMutation.isPending || !bomData.rawMaterialId || !bomData.quantityRequired}>
                            {addBomMutation.isPending ? "Adding..." : "Add to BOM"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
