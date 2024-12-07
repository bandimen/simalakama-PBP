<x-layout>
    <x-slot:title>Daftar Mata Kuliah</x-slot:title>

    <div class="min-h-full">
        <x-sidebar-kaprodi></x-sidebar-kaprodi>

        <main>
            <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <h4 class="text-4xl font-bold text-gray-900 mb-6">Daftar Mata Kuliah</h4>

                <!-- Tombol Tambah dan Search -->
                <div class="flex justify-between items-center mb-6">
                    <a href="{{ route('kaprodi.tambahMataKuliah') }}"
                       class="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">Tambah Mata Kuliah</a>
                    <form action="{{ route('kaprodi.mataKuliah') }}" method="GET" class="flex items-center">
                        <input type="text" name="search" placeholder="Cari mata kuliah..."
                               class="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring focus:ring-blue-300"
                               value="{{ request('search') }}">
                        <button type="submit"
                                class="ml-2 bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800">Cari</button>
                    </form>
                </div>

                <!-- Tabel Mata Kuliah -->
                <div class="overflow-x-auto shadow-md rounded-lg">
                    <table class="w-full text-left text-gray-500">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="px-6 py-3 text-sm font-medium text-gray-900">No</th>
                                <th class="px-6 py-3 text-sm font-medium text-gray-900">Kode Mata Kuliah</th>
                                <th class="px-6 py-3 text-sm font-medium text-gray-900">Nama Mata Kuliah</th>
                                <th class="px-6 py-3 text-sm font-medium text-gray-900">SKS</th>
                                <th class="px-6 py-3 text-sm font-medium text-gray-900">Semester</th>
                                <th class="px-6 py-3 text-sm font-medium text-gray-900">Sifat</th>
                                <th class="px-6 py-3 text-sm font-medium text-gray-900">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($mataKuliah as $index => $mk)
                                <tr class="bg-white border-b">
                                    <td class="px-6 py-4 text-sm">{{ $index + 1 }}</td>
                                    <td class="px-6 py-4 text-sm">{{ $mk->kodemk }}</td>
                                    <td class="px-6 py-4 text-sm">{{ $mk->nama }}</td>
                                    <td class="px-6 py-4 text-sm">{{ $mk->sks }}</td>
                                    <td class="px-6 py-4 text-sm">{{ $mk->semester }}</td>
                                    <td class="px-6 py-4 text-sm">{{ $mk->sifat }}</td>
                                    <td class="px-6 py-4 text-sm">
                                        <a href="{{ route('kaprodi.editMataKuliah', $mk->kodemk) }}"
                                           class="bg-yellow-500 text-white py-1 px-3 rounded-lg hover:bg-yellow-600">
                                           Edit
                                        </a>
                                        <form action="{{ route('kaprodi.deleteMataKuliah', $mk->kodemk) }}"
                                              method="POST" class="inline">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit"
                                                    class="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600"
                                                    onclick="return confirm('Yakin ingin menghapus mata kuliah ini?')">Hapus</button>
                                        </form>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>
</x-layout>
