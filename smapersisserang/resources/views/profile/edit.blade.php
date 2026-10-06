<x-admin-layout>
    <div class="max-w-3xl mx-auto space-y-6">
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Profil Akun</h1>
            <p class="mt-1 text-sm text-gray-500">Kelola informasi akun Anda.</p>
        </div>

        <div class="bg-white shadow rounded-lg p-6">
            @include('profile.partials.update-profile-information-form')
        </div>

        <div class="bg-white shadow rounded-lg p-6">
            @include('profile.partials.update-password-form')
        </div>

        <div class="bg-white shadow rounded-lg p-6">
            @include('profile.partials.delete-user-form')
        </div>
    </div>
</x-admin-layout>
