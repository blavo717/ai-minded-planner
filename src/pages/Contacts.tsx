
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
  contractor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
  supplier: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
  authority: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
  consultant: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
  other: 'bg-secondary text-secondary-foreground',
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
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contactos Externos</h1>
          <p className="text-muted-foreground mt-1">
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
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contactos por nombre, empresa o país..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contacts Grid */}
      {filteredContacts.length === 0 ? (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchTerm ? 'No se encontraron contactos' : 'No hay contactos'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
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
            <Card key={contact.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold text-card-foreground truncate">
                      {contact.name}
                    </CardTitle>
                    {contact.company && (
                      <div className="flex items-center mt-2 text-sm text-muted-foreground">
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
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium text-foreground">
                      {contact.role}
                    </p>
                  </div>
                )}
                
                <div className="space-y-3">
                  {contact.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="mr-3 h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <a 
                        href={`mailto:${contact.email}`}
                        className="text-primary hover:text-primary/80 transition-colors truncate"
                      >
                        {contact.email}
                      </a>
                    </div>
                  )}
                  
                  {contact.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="mr-3 h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <a 
                        href={`tel:${contact.phone}`}
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  )}
                  
                  {contact.country && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-3 h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{contact.country}</span>
                    </div>
                  )}
                </div>
                
                {contact.notes && (
                  <div className="p-3 bg-accent rounded-lg">
                    <p className="text-sm text-accent-foreground line-clamp-3">
                      {contact.notes}
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteContact(contact.id)}
                    disabled={isDeletingExternalContact}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
  );
};

export default Contacts;
