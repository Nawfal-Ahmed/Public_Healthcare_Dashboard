import UserLayout from "@/components/UserLayout";
import { useListVaccinations } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Syringe, MapPin, Users, FlaskConical } from "lucide-react";

export default function VaccinationsPage() {
  const { data: vaccinations, isLoading } = useListVaccinations();

  return (
    <UserLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Vaccination Programs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Available vaccines and immunization programs in your area
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-52 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (vaccinations ?? []).length === 0 ? (
          <div className="text-center py-16 bg-card border rounded-xl">
            <Syringe className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No vaccination information available</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Check back later for updates from your health authority</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(vaccinations ?? []).map((vacc) => (
              <Card key={vacc.id} data-testid={`vacc-card-${vacc.id}`} className="border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="secondary" className="mb-2 text-xs font-medium">
                        {vacc.disease}
                      </Badge>
                      <CardTitle className="text-base font-bold text-foreground">{vacc.vaccineName}</CardTitle>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Syringe className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">{vacc.description}</p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-muted/50 rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <FlaskConical className="w-3.5 h-3.5 text-primary" />
                        <p className="text-xs font-medium text-foreground">Doses</p>
                      </div>
                      <p className="text-sm font-bold">{vacc.dosesRequired} dose{vacc.dosesRequired > 1 ? "s" : ""}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <p className="text-xs font-medium text-foreground">Area</p>
                      </div>
                      <p className="text-sm font-bold truncate">{vacc.area}</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1 border-t">
                    <div className="flex gap-2">
                      <Users className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-foreground">Eligibility</p>
                        <p className="text-xs text-muted-foreground">{vacc.eligibility}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-foreground">Availability</p>
                        <p className="text-xs text-muted-foreground">{vacc.availability}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
