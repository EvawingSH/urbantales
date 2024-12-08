"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { Trash2, Plus, Download } from "lucide-react";

interface S3Item {
  Name: string;
  Config: string;
  "Wind direction": string;
  Alignment: string;
  Density: string;
  Height: string;
  "Folder Name": string;
  "Direct Download Link": string;
  "Size (MB)": string;
}

export default function S3MetadataManager() {
  const [items, setItems] = useState<S3Item[]>([]);
  const [newItem, setNewItem] = useState<S3Item>({
    Name: "",
    Config: "",
    "Wind direction": "",
    Alignment: "",
    Density: "",
    Height: "",
    "Folder Name": "",
    "Direct Download Link": "",
    "Size (MB)": "",
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/metadata");
      if (!response.ok) throw new Error("Failed to fetch items");
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
      toast({
        title: "Error",
        description: "Failed to fetch items. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddItem = async () => {
    try {
      const response = await fetch("/api/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      if (!response.ok) throw new Error("Failed to add item");
      toast({ title: "Success", description: "Item added successfully." });
      setIsAddDialogOpen(false);
      setNewItem({
        Name: "",
        Config: "",
        "Wind direction": "",
        Alignment: "",
        Density: "",
        Height: "",
        "Folder Name": "",
        "Direct Download Link": "",
        "Size (MB)": "",
      });
      fetchItems();
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (name: string) => {
    try {
      const response = await fetch(
        `/api/metadata?name=${encodeURIComponent(name)}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete item");
      toast({ title: "Success", description: "Item deleted successfully." });
      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Metadata Manager</h1>
      <div className="mb-4">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white text-black">
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {Object.keys(newItem).map((key) => (
                <div key={key} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={key} className="text-right">
                    {key}
                  </Label>
                  <Input
                    id={key}
                    value={newItem[key as keyof S3Item]}
                    onChange={(e) =>
                      setNewItem({ ...newItem, [key]: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
              ))}
            </div>
            <Button onClick={handleAddItem}>Add Item</Button>
          </DialogContent>
        </Dialog>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Config</TableHead>
              <TableHead>Wind Direction</TableHead>
              <TableHead>Alignment</TableHead>
              <TableHead>Density</TableHead>
              <TableHead>Height</TableHead>
              <TableHead>Folder Name</TableHead>
              <TableHead>Size (MB)</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.Name}>
                <TableCell>{item.Name}</TableCell>
                <TableCell>{item.Config}</TableCell>
                <TableCell>{item["Wind direction"]}</TableCell>
                <TableCell>{item.Alignment}</TableCell>
                <TableCell>{item.Density}</TableCell>
                <TableCell>{item.Height}</TableCell>
                <TableCell>{item["Folder Name"]}</TableCell>
                <TableCell>{item["Size (MB)"]}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <AlertDialog
                      open={isDeleteDialogOpen && itemToDelete === item.Name}
                      onOpenChange={(isOpen) => {
                        setIsDeleteDialogOpen(isOpen);
                        if (!isOpen) setItemToDelete(null);
                      }}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setItemToDelete(item.Name);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                     
                        <AlertDialogContent className="alert-dialog-content">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the item "{item.Name}" from the
                              S3 bucket.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteItem(item.Name)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                     
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
