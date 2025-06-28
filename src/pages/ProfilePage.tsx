
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ProfilePage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Perfil</h1>
      <Card>
        <CardHeader>
          <CardTitle>Tu Perfil</CardTitle>
          <CardDescription>Gestiona tu información personal</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Aquí podrás editar tu información de perfil.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
