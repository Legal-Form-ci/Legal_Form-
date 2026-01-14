import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Gift, Copy, Users, Wallet, ExternalLink, Share2 } from "lucide-react";

interface ReferralData {
  referral_code: string | null;
  referral_link: string | null;
  referral_count: number | null;
  referral_earnings: number | null;
}

interface ReferredUser {
  id: string;
  company_name: string;
  created_at: string;
  payment_status: string | null;
  estimated_price: number | null;
}

interface ReferralSectionProps {
  userId: string;
}

const ReferralSection = ({ userId }: ReferralSectionProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralData();
  }, [userId]);

  const fetchReferralData = async () => {
    try {
      // Get profile referral info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('referral_code, referral_link, referral_count, referral_earnings')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;
      setReferralData(profile);

      // Get referred users (requests with this user's referral code)
      if (profile?.referral_code) {
        const { data: referred, error: referredError } = await supabase
          .from('company_requests')
          .select('id, company_name, created_at, payment_status, estimated_price')
          .eq('referrer_code', profile.referral_code)
          .order('created_at', { ascending: false });

        if (!referredError && referred) {
          setReferredUsers(referred);
        }
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    toast({
      title: type === 'code' ? "Code copié !" : "Lien copié !",
      description: "Partagez-le avec vos proches pour gagner 10 000 FCFA par parrainage.",
    });
  };

  const shareLink = () => {
    if (navigator.share && referralData?.referral_link) {
      navigator.share({
        title: 'Legal Form - Création d\'entreprise',
        text: 'Créez votre entreprise en Côte d\'Ivoire avec Legal Form et bénéficiez de 10 000 FCFA de réduction avec mon lien !',
        url: referralData.referral_link,
      });
    }
  };

  if (loading) {
    return (
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="animate-pulse flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-muted"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const earnings = referralData?.referral_earnings || 0;
  const referralsCount = referralData?.referral_count || 0;
  const successfulReferrals = referredUsers.filter(r => r.payment_status === 'approved').length;

  return (
    <div className="space-y-6">
      {/* Main Referral Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Gift className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Programme Parrainage</CardTitle>
              <CardDescription>
                Gagnez 10 000 FCFA pour chaque parrainage validé
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-background rounded-xl border">
              <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">{referralsCount}</p>
              <p className="text-xs text-muted-foreground">Filleuls</p>
            </div>
            <div className="text-center p-4 bg-background rounded-xl border">
              <Gift className="h-5 w-5 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold text-foreground">{successfulReferrals}</p>
              <p className="text-xs text-muted-foreground">Validés</p>
            </div>
            <div className="text-center p-4 bg-background rounded-xl border">
              <Wallet className="h-5 w-5 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold text-foreground">{earnings.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">FCFA gagnés</p>
            </div>
            <div className="text-center p-4 bg-background rounded-xl border">
              <Wallet className="h-5 w-5 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold text-foreground">{earnings.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Disponible</p>
            </div>
          </div>

          {/* Referral Code */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Votre code parrain</label>
            <div className="flex gap-2">
              <Input
                value={referralData?.referral_code || ''}
                readOnly
                className="font-mono text-lg font-bold text-center bg-muted"
              />
              <Button
                onClick={() => copyToClipboard(referralData?.referral_code || '', 'code')}
                variant="outline"
                size="icon"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Referral Link */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Votre lien de parrainage</label>
            <div className="flex gap-2">
              <Input
                value={referralData?.referral_link || ''}
                readOnly
                className="text-sm bg-muted"
              />
              <Button
                onClick={() => copyToClipboard(referralData?.referral_link || '', 'link')}
                variant="outline"
                size="icon"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button onClick={shareLink} variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="p-4 bg-accent/10 rounded-xl border border-accent/20">
            <p className="text-sm text-foreground">
              <strong className="text-accent">Comment ça marche ?</strong>
              <br />
              1. Partagez votre lien ou code avec un proche
              <br />
              2. Il bénéficie de <strong>10 000 FCFA</strong> de réduction sur sa création d'entreprise
              <br />
              3. Vous gagnez <strong>10 000 FCFA</strong> dès que son paiement est validé
            </p>
          </div>

          {/* Withdraw Button */}
          {earnings > 0 && (
            <Button className="w-full bg-accent hover:bg-accent/90">
              <Wallet className="mr-2 h-4 w-4" />
              Demander un retrait ({earnings.toLocaleString()} FCFA)
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Referred Users List */}
      {referredUsers.length > 0 && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg">Mes filleuls</CardTitle>
            <CardDescription>
              Historique de vos parrainages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{user.company_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right">
                    {user.payment_status === 'approved' ? (
                      <>
                        <Badge className="bg-green-500 text-white">Validé</Badge>
                        <p className="text-xs text-green-600 mt-1">+10 000 FCFA</p>
                      </>
                    ) : (
                      <Badge variant="outline">En attente</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReferralSection;
