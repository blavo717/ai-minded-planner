
import React, { useState } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Plus, 
  Search,
  Trash2,
  Edit
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import CreateExternalContactModal from '@/components/modals/CreateExternalContactModal';

const contactTypeColors = {
  contractor: 'bg-blue-100 text-blue-800',
  supplier: 'bg-green-100 text-green-800',
  authority: 'bg-red-100 text-red-800',
  consultant: 'bg-purple-100 text-purple-800',
  other: 'bg-gray-100 text-gray-800',
};

const contactTypeLabels = {
  contractor: 'Contratista',
  supplier: 'Proveedor',
  authority: 'Autoridad',
  consultant: 'Consultor',
  other: 'Otro',
};

const Contacts = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { externalContacts, deleteExternalContact, isDeletingExternalContact } = useTasks();

  const filteredContacts = externalContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteContact = (contactId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este contacto?')) {
      deleteExternalContact(contactId);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contactos Externos</h1>
            <p className="text-muted-foreground">
              Gestiona contratistas, proveedores y otros contactos del proyecto
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Contacto
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar contactos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{contact.name}</CardTitle>
                    {contact.company && (
                      <div className="flex items-center mt-1 text-sm text-muted-foreground">
                        <Building2 className="mr-1 h-3 w-3" />
                        {contact.company}
                      </div>
                    )}
                  </div>
                  <Badge className={contactTypeColors[contact.contact_type]}>
                    {contactTypeLabels[contact.contact_type]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {contact.role && (
                  <p className="text-sm font-medium text-muted-foreground">
                    {contact.role}
                  </p>
                )}
                
                {contact.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                    <a 
                      href={`mailto:${contact.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {contact.email}
                    </a>
                  </div>
                )}
                
                {contact.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
                    <a 
                      href={`tel:${contact.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {contact.phone}
                    </a>
                  </div>
                )}
                
                {contact.country && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-3 w-3" />
                    {contact.country}
                  </div>
                )}
                
                {contact.notes && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {contact.notes}
                  </p>
                )}
                
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteContact(contact.id)}
                    disabled={isDeletingExternalContact}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-semibold text-muted-foreground">
              No hay contactos
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm ? 'No se encontraron contactos que coincidan con tu búsqueda.' : 'Comienza agregando tu primer contacto externo.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Contacto
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <CreateExternalContactModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </MainLayout>
  );
};

export default Contacts;
