'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Brain, DollarSign, Briefcase, TrendingUp, TrendingDown, Percent, FileText, Loader, Play, Zap, Trophy, Frown, Lightbulb, Activity, BarChart } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useEffect, useState } from 'react';
import { doc, onSnapshot, DocumentData, collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { simulationsCollection, scenarioDoc, simulationDoc } from '@/lib/collections';
import { getMacroEconomicAdvice, runMacroSimulation, startMacroSimulation } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Simulation, Scenario } from '@/lib/types/econosim';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const StatCard = ({ icon, title, value, unit = '', color = 'text-primary' }: { icon: React.ElementType, title: string, value: string | number, unit?: string, color?: string }) => {
    const Icon = icon;
    return (
        <Card className="bg-background/50 text-center">
            <CardHeader className="p-4">
                <Icon className={`w-8 h-8 mx-auto ${color}`} />
                <CardTitle className="text-lg mt-2 font-headline">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <p className="text-3xl font-bold font-code">
                    {value}{unit}
                </p>
            </CardContent>
        </Card>
    );
};

export default function EconoSimPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [simulation, setSimulation] = useState<Simulation | null>(null);
    const [scenario, setScenario] = useState<(Scenario & { id?: string }) | null>(null);
    const [loading, setLoading] = useState(true);
    const [startingGame, setStartingGame] = useState(false);
    const [simRunning, setSimRunning] = useState(false);
    const [advice, setAdvice] = useState<string | null>(null);
    const [adviceLoading, setAdviceLoading] = useState(false);

    // Local state for policy inputs
    const [interestRate, setInterestRate] = useState(5);
    const [taxRate, setTaxRate] = useState(20);

    useEffect(() => {
        if (!user) return;
        
        // Query the top-level collection for the user's simulation
        const q = query(simulationsCollection, where("uid", "==", user.uid));
        
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            if (!snapshot.empty) {
                const simDoc = snapshot.docs[0];
                const simData = { id: simDoc.id, ...simDoc.data() } as Simulation;
                setSimulation(simData);
                
                if (simData.scenarioId) {
                    const scenarioRef = scenarioDoc(simData.scenarioId);
                    const scenarioSnap = await getDoc(scenarioRef);
                    if (scenarioSnap.exists()) {
                        const loadedScenario = scenarioSnap.data() as Scenario;
                        // Merge the scenarioId as id into the scenario object
                        setScenario({ ...loadedScenario, id: simData.scenarioId });
                        if (simData.status === 'active' && simData.inputs) {
                            setInterestRate(simData.inputs.interestRate || loadedScenario.initialValues.interestRate || 5);
                            setTaxRate(simData.inputs.taxRate || loadedScenario.initialValues.taxRate || 20);
                        } else if (simData.status === 'not-started') {
                            setInterestRate(loadedScenario.initialValues.interestRate || 5);
                            setTaxRate(loadedScenario.initialValues.taxRate || 20);
                        }
                    }
                }
            } else {
                setSimulation(null);
                setScenario(null);
            }
            setLoading(false);
        }, (error) => {
            console.error("EconoSim fetch error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleStartGame = async () => {
        if (!user || !simulation) return;
        setStartingGame(true);
        try {
            await startMacroSimulation({ simulationId: simulation.id });
             if (scenario?.initialValues) {
                setInterestRate(scenario.initialValues.interestRate || 5);
                setTaxRate(scenario.initialValues.taxRate || 20);
            }
        } catch (e) {
            console.error(e);
            toast({ title: "Error", description: "Could not start the simulation.", variant: 'destructive' });
        } finally {
            setStartingGame(false);
        }
    };
    
    const handleRunSimulation = async () => {
        if (!user || !simulation || !scenario || !scenario.id) return;
        setSimRunning(true);
        setAdvice(null);
        try {
            await runMacroSimulation({
                simulationId: simulation.id,
                scenarioId: scenario.id,
                inputs: { interestRate, taxRate }
            });
            toast({ title: 'Simulation Complete', description: 'Economic outputs have been updated.', variant: 'default' });
        } catch (e) {
            console.error(e);
            toast({ title: "Error", description: "Could not run the simulation.", variant: 'destructive' });
        } finally {
            setSimRunning(false);
        }
    }

    const handleGetAdvice = async () => {
        if (!simulation || !scenario) return;
        setAdviceLoading(true);
        setAdvice(null);
        try {
            const result = await getMacroEconomicAdvice({
                currentOutputs: simulation.outputs,
                scenarioTitle: scenario.title
            });
            setAdvice(result.advice);
        } catch (e) {
            console.error(e);
            toast({ title: "Error", description: "Could not get AI advice.", variant: 'destructive' });
        } finally {
            setAdviceLoading(false);
        }
    }

    if (loading) {
        return <div className="flex h-64 items-center justify-center"><Loader className="w-12 h-12 animate-spin text-primary" /></div>
    }

    if (!simulation) {
        return (
             <motion.div variants={pageVariants} initial="initial" animate="in" exit="out" transition={{ type: 'tween', ease: 'anticipate', duration: 0.5 }}>
                <Card className="bg-card/70 backdrop-blur-sm text-center">
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl text-destructive">No Simulation Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>No EconoSim data found for your user. Please contact an administrator or run the `seed` script.</p>
                    </CardContent>
                </Card>
            </motion.div>
        )
    }

    if (simulation.status === 'not-started') {
        return (
            <motion.div variants={pageVariants} initial="initial" animate="in" exit="out" className="space-y-8">
                 <div>
                    <h1 className="text-4xl font-headline tracking-wider text-foreground">EconoSim</h1>
                    <p className="text-muted-foreground font-body text-lg">Welcome to the '{scenario?.title}' Scenario.</p>
                </div>
                <Card className="bg-card/70 backdrop-blur-sm text-center p-8">
                    <CardHeader>
                        <CardTitle className="font-headline text-4xl text-primary">{scenario?.title}</CardTitle>
                        <CardDescription className="max-w-2xl mx-auto mt-4">
                           {scenario?.description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button size="lg" onClick={handleStartGame} disabled={startingGame}>
                           {startingGame ? <Loader className="mr-2 animate-spin"/> : <Play className="mr-2" />}
                           Start Simulation
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        )
    }

    const outputs = simulation.outputs;

    return (
        <motion.div
         initial="initial"
         animate="in"
         exit="out"
         variants={pageVariants}
         transition={{ type: 'tween', ease: 'anticipate', duration: 0.5 }}
         className="space-y-8"
        >
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-headline tracking-wider text-foreground">EconoSim: {scenario?.title}</h1>
                    <p className="text-muted-foreground font-body text-lg">Your choices shape the economy.</p>
                </div>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/50 py-2 px-4 text-lg capitalize">
                    <Activity className="mr-2" /> Active
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={BarChart} title="GDP" value={`${outputs.gdp.toFixed(1)}B`} unit=" USD" color="text-green-400" />
                <StatCard icon={TrendingDown} title="Inflation" value={outputs.inflation.toFixed(1)} unit="%" color="text-red-400" />
                <StatCard icon={Briefcase} title="Employment" value={outputs.jobs.toFixed(1)} unit="%" color="text-cyan-400" />
            </div>

            <Card className="bg-card/70 backdrop-blur-sm">
                <CardHeader>
                     <CardTitle className="font-headline text-primary flex items-center gap-2"><Zap/> Policy Control Panel</CardTitle>
                     <CardDescription>Adjust the economic levers and run the simulation to see the impact.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                        <div>
                            <Label htmlFor="interest-rate" className="text-lg">Interest Rate: {interestRate.toFixed(1)}%</Label>
                            <Slider
                                id="interest-rate"
                                min={0}
                                max={15}
                                step={0.5}
                                value={[interestRate]}
                                onValueChange={(value) => setInterestRate(value[0])}
                                disabled={simRunning}
                            />
                            <p className="text-xs text-muted-foreground">Higher rates cool inflation but may slow GDP.</p>
                        </div>
                         <div>
                            <Label htmlFor="tax-rate" className="text-lg">Tax Rate: {taxRate}%</Label>
                            <Slider
                                id="tax-rate"
                                min={10}
                                max={50}
                                step={1}
                                value={[taxRate]}
                                onValueChange={(value) => setTaxRate(value[0])}
                                disabled={simRunning}
                            />
                             <p className="text-xs text-muted-foreground">Affects government revenue and consumer spending.</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                         <Button size="lg" className="w-full h-16 text-xl font-headline" onClick={handleRunSimulation} disabled={simRunning}>
                            {simRunning ? <Loader className="mr-2 animate-spin" /> : <Play className="mr-2" />}
                            Run Simulation
                        </Button>
                    </div>
                </CardContent>
                 <CardFooter className="flex-col items-stretch gap-4">
                    <Button className="w-full" onClick={handleGetAdvice} disabled={adviceLoading || simRunning} variant="outline">
                        {adviceLoading ? <Loader className="mr-2 animate-spin" /> : <Lightbulb className="mr-2" />}
                        Get AI Economic Advisor's Opinion
                    </Button>
                    {advice && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                            <Alert className="border-primary/50">
                                <Lightbulb className="h-4 w-4 text-primary" />
                                <AlertTitle className="text-primary font-headline">AI Advisor</AlertTitle>
                                <AlertDescription className="whitespace-pre-line">
                                    {advice}
                                </AlertDescription>
                            </Alert>
                        </motion.div>
                    )}
                 </CardFooter>
            </Card>
        </motion.div>
    );
}
