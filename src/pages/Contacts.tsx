
import React, { useState } from 'react';
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
  Users
} from 'lucide-react';
import { useExternalContacts } from '@/hooks/useExternalContacts';
import { useExternalContactMutations } from '@/hooks/useExternalContactMutations';
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
  const { externalContacts } = useExternalContacts();
  const { deleteExternalContact, isDeletingExternalContact } = useExternalContactMutations();

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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contactos Externos</h1>
            <p className="text-gray-600 mt-1">
              Gestiona contratistas, proveedores y otros contactos del proyecto
            </p>
          </div>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="shrink-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Contacto
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="bg-white">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar contactos por nombre, empresa o país..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contacts Grid */}
        {filteredContacts.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No se encontraron contactos' : 'No hay contactos'}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md">
                {searchTerm 
                  ? 'No se encontraron contactos que coincidan con tu búsqueda.' 
                  : 'Comienza agregando tu primer contacto externo para gestionar mejor tus proyectos.'
                }
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  size="lg"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Contacto
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredContacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-lg transition-shadow duration-200 bg-white">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                        {contact.name}
                      </CardTitle>
                      {contact.company && (
                        <div className="flex items-center mt-2 text-sm text-gray-600">
                          <Building2 className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{contact.company}</span>
                        </div>
                      )}
                    </div>
                    <Badge className={`${contactTypeColors[contact.contact_type]} flex-shrink-0`}>
                      {contactTypeLabels[contact.contact_type]}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {contact.role && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">
                        {contact.role}
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {contact.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="mr-3 h-4 w-4 text-gray-400 flex-shrink-0" />
                        <a 
                          href={`mailto:${contact.email}`}
                          className="text-blue-600 hover:text-blue-700 transition-colors truncate"
                        >
                          {contact.email}
                        </a>
                      </div>
                    )}
                    
                    {contact.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="mr-3 h-4 w-4 text-gray-400 flex-shrink-0" />
                        <a 
                          href={`tel:${contact.phone}`}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          {contact.phone}
                        </a>
                      </div>
                    )}
                    
                    {contact.country && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="mr-3 h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{contact.country}</span>
                      </div>
                    )}
                  </div>
                  
                  {contact.notes && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {contact.notes}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-end pt-3 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteContact(contact.id)}
                      disabled={isDeletingExternalContact}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <CreateExternalContactModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default Contacts;
