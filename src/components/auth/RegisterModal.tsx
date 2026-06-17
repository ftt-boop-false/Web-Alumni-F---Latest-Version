"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (data: any) => void;
}

export const RegisterModal = ({ isOpen, onClose, onRegister }: RegisterModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nama: '',
    gelar: '',
    prodi: '',
    angkatan: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.prodi || !formData.angkatan) {
      toast({
        title: "Data Tidak Lengkap",
        description: "Mohon isi semua bidang yang wajib (Nama, Prodi, dan Angkatan).",
        variant: "destructive"
      });
      return;
    }

    onRegister(formData);
    toast({
      title: "Pendaftaran Berhasil",
      description: "Data Anda telah tersimpan di sistem verifikasi Alumni Hub F.",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-red-800">Daftar Akun Alumni</DialogTitle>
          <DialogDescription>
            Lengkapi data profil Anda untuk bergabung dengan jaringan Alumni Hub F IPB.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Lengkap dan Gelar</Label>
            <Input
              id="nama"
              placeholder="Contoh: Dr. Ir. Budi Santoso, M.T."
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="prodi">Program Studi sewaktu di FTT</Label>
            <Select onValueChange={(v) => setFormData({ ...formData, prodi: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Program Studi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Teknik Pertanian">Teknik Pertanian (TEP)</SelectItem>
                <SelectItem value="Teknologi Industri Pertanian">Teknologi Industri Pertanian (TIN)</SelectItem>
                <SelectItem value="Teknologi Pangan">Teknologi Pangan (ITP)</SelectItem>
                <SelectItem value="Teknik Sipil dan Lingkungan">Teknik Sipil dan Lingkungan (SIL)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="angkatan">Angkatan (Contoh: 45)</Label>
            <Input
              id="angkatan"
              type="number"
              placeholder="Masukkan nomor angkatan"
              value={formData.angkatan}
              onChange={(e) => setFormData({ ...formData, angkatan: e.target.value })}
            />
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <p className="text-xs text-red-800 leading-relaxed">
              <strong>Catatan:</strong> Pendaftaran Anda akan diverifikasi oleh staf fakultas berdasarkan database kelulusan IPB University.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" className="bg-red-800 hover:bg-red-700">
              Kirim Pendaftaran
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};