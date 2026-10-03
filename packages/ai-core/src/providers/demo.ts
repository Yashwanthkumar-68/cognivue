import {
  GemmaMultimodalExtraction,
  KnowledgeGraph,
  DiagnosticQuestion,
  SemanticEvaluation,
  LearningGapMap,
  SourceConflict,
  StructuredLessonPlan,
  StructuredEditPlan
} from '@learnlens/schemas';
import { AIProvider } from '../types.js';

export class DemoProvider implements AIProvider {
  name = 'LearnLens Deterministic Benchmark Provider';
  category = 'demo_benchmark' as const;
  modelId = 'benchmark/dbms-ground-truth-v1';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async extractMultimodalContent(source: {
    id: string;
    title: string;
    type: string;
    text?: string;
    mediaUrl?: string;
  }): Promise<GemmaMultimodalExtraction> {
    if (source.title.toLowerCase().includes('handwritten')) {
      return {
        sourceId: source.id,
        sourceTitle: source.title,
        concepts: [
          {
            name: 'Transitive Dependency',
            definition: 'A functional dependency X -> Z where X -> Y and Y -> Z hold, and Y is not a candidate key.',
            confidence: 0.94,
            prerequisites: ['Functional Dependency', 'Candidate Key'],
            evidenceQuotesOrRegions: ['Handwritten derivation step 3: "If A->B and B->C, then A->C is transitive"']
          },
          {
            name: 'Partial Dependency',
            definition: 'A non-prime attribute depends on only a subset of a composite candidate key.',
            confidence: 0.91,
            prerequisites: ['Prime Attribute', 'Composite Key'],
            evidenceQuotesOrRegions: ['Margin note: "2NF requires full functional dependency on the key"']
          }
        ],
        visualRegions: [
          {
            id: 'vr_hw_1',
            box2d: [120, 80, 480, 920],
            label: 'Handwritten Derivation: 2NF vs 3NF',
            confidence: 0.96,
            interpretation: 'Step-by-step notes comparing relational decomposition algorithms. Student has circled Transitive Dependency with a question mark.'
          },
          {
            id: 'vr_hw_2',
            box2d: [510, 100, 880, 900],
            label: 'Questionable Deductive Step',
            confidence: 0.89,
            interpretation: 'Student incorrectly wrote "If A->B is partial, B->C is transitive, therefore partial implies transitive". Detected cognitive conflation.'
          }
        ],
        diagrams: [],
        equations: [
          {
            latex: 'R(A,B,C) \\quad \\text{with } A \\to B, B \\to C',
            explanation: 'Classic canonical example demonstrating transitive dependency violating 3NF.',
            derivationSteps: [
              {
                stepIndex: 1,
                formula: 'Candidate\\ Key = \\{A\\}',
                description: 'A uniquely determines B, and B determines C, hence A+ = {A,B,C}.',
                isQuestionable: false
              },
              {
                stepIndex: 2,
                formula: 'B \\to C \\implies \\text{Non-prime attribute determines non-prime attribute}',
                description: 'B is not a superkey, and C is not a prime attribute.',
                isQuestionable: false
              },
              {
                stepIndex: 3,
                formula: 'Partial = Transitive?',
                description: 'Student note erroneously equated non-key transitives with partial key dependencies.',
                isQuestionable: true,
                errorAnnotation: 'Conflating 2NF partial key dependency with 3NF transitive dependency'
              }
            ],
            confidence: 0.95
          }
        ],
        codeSnippets: [],
        questionPatterns: [],
        summary: 'Gemma 4 successfully parsed the handwritten relational derivation. Identified a critical misconception in step 3 where the student confused partial key dependencies with transitive dependencies.',
        model: 'google/gemma-4-31B-it'
      };
    }

    if (source.title.toLowerCase().includes('diagram') || source.type === 'diagram' || source.type === 'image') {
      return {
        sourceId: source.id,
        sourceTitle: source.title,
        concepts: [
          {
            name: 'Entity-Relationship Model',
            definition: 'A visual conceptual representation of data entities, their attributes, and inter-entity associations.',
            confidence: 0.98,
            prerequisites: [],
            evidenceQuotesOrRegions: ['ER Diagram schema root']
          },
          {
            name: 'Cardinality Ratio',
            definition: 'The number of relationship instances in which an entity can participate (1:1, 1:N, M:N).',
            confidence: 0.95,
            prerequisites: ['Entity-Relationship Model'],
            evidenceQuotesOrRegions: ['Relationship diamond "PLACES" marked with (1) Customer to (N) Orders']
          }
        ],
        visualRegions: [
          {
            id: 'vr_er_1',
            box2d: [50, 60, 420, 450],
            label: 'Entity: Customer [CustomerID (PK), Name, Email]',
            confidence: 0.99,
            interpretation: 'Strong entity representing customer account records.'
          },
          {
            id: 'vr_er_2',
            box2d: [50, 550, 420, 940],
            label: 'Entity: Orders [OrderID (PK), OrderDate, Total]',
            confidence: 0.98,
            interpretation: 'Order entity with 1:N participation from Customer.'
          },
          {
            id: 'vr_er_3',
            box2d: [480, 300, 850, 700],
            label: 'Relationship: Contains [Quantity, UnitPrice]',
            confidence: 0.93,
            interpretation: 'Many-to-many relationship decomposed into OrderItems bridge relation.'
          }
        ],
        diagrams: [
          {
            diagramType: 'er_diagram',
            title: 'E-Commerce Core Relational Schema',
            entities: [
              {
                id: 'ent_customer',
                name: 'Customer',
                type: 'entity',
                attributes: ['CustomerID (PK)', 'Name', 'Email', 'Tier'],
                connectedTo: ['rel_places']
              },
              {
                id: 'ent_order',
                name: 'Order',
                type: 'entity',
                attributes: ['OrderID (PK)', 'OrderDate', 'CustomerID (FK)', 'TotalAmount'],
                connectedTo: ['rel_places', 'rel_contains']
              },
              {
                id: 'rel_places',
                name: 'Places',
                type: 'relationship',
                attributes: [],
                cardinality: '1:N',
                connectedTo: ['ent_customer', 'ent_order']
              }
            ],
            confidence: 0.97,
            explanation: 'Gemma 4 extracted 3 core entities, 1 composite bridge relationship, and primary/foreign key mappings with 97% confidence.',
            suspiciousOrAmbiguousSteps: []
          }
        ],
        equations: [],
        codeSnippets: [],
        questionPatterns: [
          {
            patternTitle: 'Convert ER Diagram to Normalized Relational Tables',
            frequency: 'high',
            typicalMarks: 10,
            associatedConcepts: ['ER Model', 'Relational Mapping', '1NF', 'Foreign Keys']
          }
        ],
        summary: 'Gemma 4 analyzed the visual ER diagram layout, extracted entities, attributes, and cardinality constraints, and mapped them to relational database structures.',
        model: 'google/gemma-4-31B-it'
      };
    }

    // Default extraction for textbook / slides / question papers
    return {
      sourceId: source.id,
      sourceTitle: source.title,
      concepts: [
        {
          name: 'Normalization',
          definition: 'The formal algorithmic process of organizing data attributes in a relational database to minimize redundancy and eliminate insertion, update, and deletion anomalies.',
          confidence: 0.99,
          prerequisites: ['Relational Model', 'Functional Dependency'],
          evidenceQuotesOrRegions: ['Section 8.1: "Relational Database Design and Normal Forms"']
        },
        {
          name: 'Boyce-Codd Normal Form (BCNF)',
          definition: 'A relational schema is in BCNF with respect to a set of functional dependencies if, for every non-trivial FD X -> Y, X is a superkey.',
          confidence: 0.96,
          prerequisites: ['3NF', 'Superkey'],
          evidenceQuotesOrRegions: ['Section 8.5: "Boyce-Codd Normal Form strictly eliminates all transitive and partial anomalies"']
        },
        {
          name: 'Lossless Decomposition',
          definition: 'A decomposition of relation R into R1 and R2 is lossless if natural join of R1 and R2 reconstructs R without spurious tuples.',
          confidence: 0.93,
          prerequisites: ['Normalization', 'Relational Algebra'],
          evidenceQuotesOrRegions: ['Section 8.3: "Lossless-Join Decompositions"']
        }
      ],
      visualRegions: [
        {
          id: 'vr_tb_1',
          box2d: [100, 50, 450, 950],
          label: 'Anomalies Table: Insert, Update, Delete',
          confidence: 0.94,
          interpretation: 'Comparison matrix showing how un-normalized relations create data inconsistencies.'
        }
      ],
      diagrams: [],
      equations: [
        {
          latex: 'R_1 \\cap R_2 \\to R_1 \\quad \\lor \\quad R_1 \\cap R_2 \\to R_2',
          explanation: 'Necessary and sufficient condition for a binary decomposition to be lossless-join.',
          derivationSteps: [
            {
              stepIndex: 1,
              formula: '\\Pi_{R_1}(R) \\bowtie \\Pi_{R_2}(R) = R',
              description: 'Natural join guarantees exact equivalence with original relation.',
              isQuestionable: false
            }
          ],
          confidence: 0.98
        }
      ],
      codeSnippets: [
        {
          language: 'sql',
          codeSnippet: 'CREATE TABLE StudentCourse (\n  StudentID INT,\n  CourseID VARCHAR(10),\n  Instructor VARCHAR(50),\n  OfficeLocation VARCHAR(50),\n  PRIMARY KEY (StudentID, CourseID)\n);',
          conceptsDemonstrated: ['2NF Violation', 'Transitive Dependency'],
          explanation: 'Instructor determines OfficeLocation, violating 3NF because Instructor is not a candidate key.',
          potentialBugsOrPitfalls: ['OfficeLocation update anomaly if instructor moves offices']
        }
      ],
      questionPatterns: [
        {
          patternTitle: 'Identify Highest Normal Form & Decompose to 3NF/BCNF',
          frequency: 'high',
          typicalMarks: 10,
          associatedConcepts: ['Functional Dependency', '2NF', '3NF', 'BCNF']
        },
        {
          patternTitle: 'Test for Lossless Join and Dependency Preservation',
          frequency: 'high',
          typicalMarks: 8,
          associatedConcepts: ['Lossless Decomposition', 'Dependency Preservation']
        }
      ],
      summary: 'Gemma 4 analyzed the technical textbook chapter, extracting mathematical definitions of normal forms, SQL anomaly examples, and university exam problem patterns.',
      model: 'google/gemma-4-31B-it'
    };
  }

  async synthesizeKnowledgeGraph(sources: any[], spaceTitle: string): Promise<KnowledgeGraph> {
    const nodes = [
      {
        id: 'c_dbms_root',
        name: 'Database Management Systems',
        shortSummary: 'Foundational principles of relational data modeling and querying.',
        fullExplanation: 'DBMS provides systematic methods for creating, maintaining, and querying structured data with ACID guarantees.',
        category: 'Core Foundations',
        complexity: 1,
        examWeight: 0.3,
        learningStatus: 'mastered' as const,
        confidence: 0.99,
        masteryScore: 0.95,
        prerequisites: [],
        examples: ['PostgreSQL', 'SQLite', 'Oracle DBMS'],
        sourceReferences: [
          {
            sourceId: 'src_tb',
            sourceTitle: 'DBMS Textbook (Silberschatz)',
            sourceType: 'pdf',
            excerptOrRegion: 'Chapter 1: Database System Concepts',
            pageOrSlide: 3,
            confidence: 0.98
          }
        ],
        hasConflict: false
      },
      {
        id: 'c_er_model',
        name: 'ER Model',
        shortSummary: 'High-level conceptual data model representing entities and relationships.',
        fullExplanation: 'Entity-Relationship modeling translates real-world requirements into schema diagrams using entities, attributes, and relationships.',
        category: 'Data Modeling',
        complexity: 2,
        examWeight: 0.7,
        learningStatus: 'mastered' as const,
        confidence: 0.95,
        masteryScore: 0.9,
        prerequisites: ['c_dbms_root'],
        examples: ['Customer-Order diagram', 'University Enrollment schema'],
        sourceReferences: [
          {
            sourceId: 'src_er',
            sourceTitle: 'E-Commerce Schema ER Diagram',
            sourceType: 'diagram',
            excerptOrRegion: 'Entity layout: Customer -> Places -> Orders',
            confidence: 0.97
          }
        ],
        hasConflict: false
      },
      {
        id: 'c_rel_model',
        name: 'Relational Model',
        shortSummary: 'Mathematical relation-based data representation using tables, tuples, and keys.',
        fullExplanation: 'Introduced by E.F. Codd; structures data as mathematical relations with candidate keys and referential integrity.',
        category: 'Relational Architecture',
        complexity: 2,
        examWeight: 0.65,
        learningStatus: 'mastered' as const,
        confidence: 0.96,
        masteryScore: 0.88,
        prerequisites: ['c_er_model'],
        examples: ['Tables with foreign key constraints'],
        sourceReferences: [
          {
            sourceId: 'src_tb',
            sourceTitle: 'DBMS Textbook (Silberschatz)',
            sourceType: 'pdf',
            excerptOrRegion: 'Chapter 2: Relational Model',
            pageOrSlide: 45,
            confidence: 0.95
          }
        ],
        hasConflict: false
      },
      {
        id: 'c_fd',
        name: 'Functional Dependency',
        shortSummary: 'Constraint between two sets of attributes in a relational database.',
        fullExplanation: 'X -> Y specifies that value of X uniquely determines value of Y. The foundation for all normal form decompositions.',
        category: 'Relational Design',
        complexity: 3,
        examWeight: 0.85,
        learningStatus: 'learning' as const,
        confidence: 0.94,
        masteryScore: 0.82,
        prerequisites: ['c_rel_model'],
        examples: ['StudentID -> (Name, DOB, Major)'],
        sourceReferences: [
          {
            sourceId: 'src_tb',
            sourceTitle: 'DBMS Textbook (Silberschatz)',
            sourceType: 'pdf',
            excerptOrRegion: 'Section 8.2: Functional Dependency Theory',
            pageOrSlide: 182,
            confidence: 0.96
          }
        ],
        hasConflict: false
      },
      {
        id: 'c_1nf',
        name: '1NF (First Normal Form)',
        shortSummary: 'Requires all attribute values to be atomic and indivisible.',
        fullExplanation: 'A relation is in 1NF if and only if the domain of each attribute contains only atomic values and no repeating groups.',
        category: 'Normalization',
        complexity: 2,
        examWeight: 0.6,
        learningStatus: 'mastered' as const,
        confidence: 0.97,
        masteryScore: 0.92,
        prerequisites: ['c_fd'],
        examples: ['Eliminating comma-separated phone numbers into individual rows'],
        sourceReferences: [
          {
            sourceId: 'src_slides',
            sourceTitle: 'Prof. Vance Lecture 14 Slides',
            sourceType: 'pptx',
            excerptOrRegion: 'Slide 8: 1NF Definition & Atomicity',
            pageOrSlide: 8,
            confidence: 0.95
          }
        ],
        hasConflict: false
      },
      {
        id: 'c_2nf',
        name: '2NF (Second Normal Form)',
        shortSummary: 'Relation is in 1NF and no non-prime attribute is partially dependent on any candidate key.',
        fullExplanation: '2NF eliminates partial functional dependency. Every non-prime attribute must depend on the whole candidate key, not just a subset.',
        category: 'Normalization',
        complexity: 3,
        examWeight: 0.8,
        learningStatus: 'weak' as const,
        confidence: 0.92,
        masteryScore: 0.58,
        prerequisites: ['c_1nf'],
        examples: ['Orders(OrderID, ItemID, OrderDate, ItemName): OrderDate depends only on OrderID'],
        sourceReferences: [
          {
            sourceId: 'src_slides',
            sourceTitle: 'Prof. Vance Lecture 14 Slides',
            sourceType: 'pptx',
            excerptOrRegion: 'Slide 14: Partial Dependencies and 2NF',
            pageOrSlide: 14,
            confidence: 0.93
          },
          {
            sourceId: 'src_notes',
            sourceTitle: 'Handwritten Relational Derivation Notes',
            sourceType: 'handwritten',
            excerptOrRegion: 'Note section: "2NF requires full functional dependency on the key"',
            confidence: 0.9
          }
        ],
        hasConflict: false
      },
      {
        id: 'c_3nf',
        name: '3NF (Third Normal Form)',
        shortSummary: 'In 2NF and no non-prime attribute is transitively dependent on any candidate key.',
        fullExplanation: 'For every functional dependency X -> A, either X is a superkey OR A is a prime attribute. Eliminates transitive dependencies.',
        category: 'Normalization',
        complexity: 4,
        examWeight: 0.95,
        learningStatus: 'weak' as const,
        confidence: 0.9,
        masteryScore: 0.52,
        prerequisites: ['c_2nf'],
        examples: ['Student(ID, DeptName, Building): ID -> DeptName -> Building is transitive'],
        sourceReferences: [
          {
            sourceId: 'src_tb',
            sourceTitle: 'DBMS Textbook (Silberschatz)',
            sourceType: 'pdf',
            excerptOrRegion: 'Section 8.4: Third Normal Form',
            pageOrSlide: 194,
            confidence: 0.95
          },
          {
            sourceId: 'src_slides',
            sourceTitle: 'Prof. Vance Lecture 14 Slides',
            sourceType: 'pptx',
            excerptOrRegion: 'Slide 22: 3NF vs BCNF Trade-offs',
            pageOrSlide: 22,
            confidence: 0.92
          }
        ],
        hasConflict: true // Conflict with Professor slides vs Textbook!
      },
      {
        id: 'c_bcnf',
        name: 'BCNF (Boyce-Codd Normal Form)',
        shortSummary: 'Stricter version of 3NF: for every non-trivial FD X -> Y, X must be a superkey.',
        fullExplanation: 'BCNF completely eliminates redundant functional dependencies even if Y is a prime attribute. May not preserve all functional dependencies.',
        category: 'Normalization',
        complexity: 4,
        examWeight: 0.9,
        learningStatus: 'not_started' as const,
        confidence: 0.88,
        masteryScore: 0.15,
        prerequisites: ['c_3nf'],
        examples: ['Zipcode -> City, Address relation where Street + City -> Zipcode'],
        sourceReferences: [
          {
            sourceId: 'src_tb',
            sourceTitle: 'DBMS Textbook (Silberschatz)',
            sourceType: 'pdf',
            excerptOrRegion: 'Section 8.5: Boyce-Codd Normal Form',
            pageOrSlide: 201,
            confidence: 0.94
          }
        ],
        hasConflict: true
      },
      {
        id: 'c_lossless',
        name: 'Lossless Decomposition',
        shortSummary: 'Decomposing a relation such that natural join of decomposed relations exactly reconstructs the original.',
        fullExplanation: 'A decomposition D = {R1, R2} is lossless with respect to F if R1 ∩ R2 -> R1 or R1 ∩ R2 -> R2 is in F+.',
        category: 'Decomposition Theory',
        complexity: 4,
        examWeight: 0.85,
        learningStatus: 'not_started' as const,
        confidence: 0.86,
        masteryScore: 0.1,
        prerequisites: ['c_3nf', 'c_bcnf'],
        examples: ['Testing R1 ∩ R2 -> R1 via attribute closure'],
        sourceReferences: [
          {
            sourceId: 'src_exam',
            sourceTitle: '2024 DBMS End-Sem Exam Paper',
            sourceType: 'question_paper',
            excerptOrRegion: 'Question 4(b): Prove lossless decomposition of R(A,B,C,D)',
            pageOrSlide: 2,
            confidence: 0.98
          }
        ],
        hasConflict: false
      }
    ];

    const edges = [
      { id: 'e1', source: 'c_dbms_root', target: 'c_er_model', type: 'leads_to' as const, label: 'conceptual design', confidence: 0.98 },
      { id: 'e2', source: 'c_er_model', target: 'c_rel_model', type: 'leads_to' as const, label: 'mapping to relations', confidence: 0.95 },
      { id: 'e3', source: 'c_rel_model', target: 'c_fd', type: 'leads_to' as const, label: 'functional constraints', confidence: 0.96 },
      { id: 'e4', source: 'c_fd', target: 'c_1nf', type: 'prerequisite' as const, label: 'prerequisite', confidence: 0.98 },
      { id: 'e5', source: 'c_1nf', target: 'c_2nf', type: 'prerequisite' as const, label: 'eliminates partial FD', confidence: 0.95 },
      { id: 'e6', source: 'c_2nf', target: 'c_3nf', type: 'prerequisite' as const, label: 'eliminates transitive FD', confidence: 0.96 },
      { id: 'e7', source: 'c_3nf', target: 'c_bcnf', type: 'prerequisite' as const, label: 'strengthens to superkeys', confidence: 0.94 },
      { id: 'e8', source: 'c_3nf', target: 'c_lossless', type: 'prerequisite' as const, label: 'decomposition verification', confidence: 0.92 },
      { id: 'e9', source: 'c_bcnf', target: 'c_lossless', type: 'prerequisite' as const, label: 'guarantee condition', confidence: 0.91 }
    ];

    return {
      spaceId: 'space_dbms_demo',
      spaceTitle: spaceTitle || 'DBMS — Final Exam Preparation',
      nodes,
      edges,
      generatedAt: new Date().toISOString(),
      reasoningModel: 'deepseek-ai/DeepSeek-R1 (Open-Weight Reasoning Layer)'
    };
  }

  async detectSourceConflicts(sources: any[], concepts: any[]): Promise<SourceConflict[]> {
    return [
      {
        id: 'conflict_3nf_bcnf_priority',
        conceptId: 'c_3nf',
        conceptName: '3NF vs BCNF Decomposition Standard',
        conflictType: 'context' as const,
        severity: 'high' as const,
        title: '3NF Sufficiency vs BCNF Necessity in Practical Design',
        sourceA: {
          sourceId: 'src_slides',
          sourceTitle: 'Prof. Vance Lecture 14 Slides',
          sourceType: 'pptx',
          pageOrSlide: 22,
          quote: '"In practice, 3NF is strictly preferred in enterprise schema designs because dependency preservation is guaranteed, whereas BCNF may forfeit functional dependency enforcement."',
          claim: '3NF is the superior practical stopping point because it guarantees dependency preservation.'
        },
        sourceB: {
          sourceId: 'src_tb',
          sourceTitle: 'DBMS Textbook (Silberschatz)',
          sourceType: 'pdf',
          pageOrSlide: 201,
          quote: '"BCNF is the gold standard of relational normalization. A relation that is merely in 3NF still harbors data redundancy whenever a prime attribute is determined by a non-superkey."',
          claim: 'BCNF is the required gold standard because 3NF still tolerates redundancy.'
        },
        whyDifferent: 'The textbook approaches normalization from pure mathematical minimization of update anomalies, whereas the professor emphasizes engineering operational realities where checking cross-table dependencies in SQL is prohibitively expensive.',
        terminologyVsContradictionAnalysis: 'Contextual difference in engineering priorities: Textbook prioritizes anomaly prevention; Professor prioritizes dependency preservation performance. Both agree on the mathematical definition.',
        aiResolutionGuidance: 'For your exam: Always decompose to BCNF first. If the decomposition is NOT dependency-preserving, state explicitly that 3NF must be retained to maintain dependency preservation without costly assertions.',
        examTip: 'Examiners frequently award full marks when a student decomposes to 3NF, checks for BCNF, and explains why 3NF was chosen due to lost dependencies.'
      }
    ];
  }

  async analyzeLearningGaps(concepts: any[], sources: any[], examSyllabus?: string): Promise<LearningGapMap> {
    const gaps = [
      {
        id: 'gap_bcnf',
        conceptId: 'c_bcnf',
        conceptName: 'Boyce-Codd Normal Form (BCNF)',
        status: 'missing' as const,
        prerequisiteImportance: 9,
        examRelevance: 10,
        studentWeaknessScore: 0.95,
        sourceCoverageScore: 0.4,
        priorityScore: 96,
        primaryEvidence: 'Appeared in Question 4 of 2024 End-Sem Exam (10 marks) but student notes skip BCNF testing algorithm.',
        sourceReferences: ['2024 DBMS End-Sem Exam Paper Q4', 'Prof. Vance Lecture Slide 22'],
        actionRecommendation: 'Generate targeted visual lesson on the BCNF violation test: verifying that the LHS of every FD is a superkey.'
      },
      {
        id: 'gap_lossless',
        conceptId: 'c_lossless',
        conceptName: 'Lossless Join Decomposition Condition',
        status: 'missing' as const,
        prerequisiteImportance: 8,
        examRelevance: 9,
        studentWeaknessScore: 0.9,
        sourceCoverageScore: 0.5,
        priorityScore: 88,
        primaryEvidence: 'Essential 8-mark derivation in question papers. Absent from handwritten student summary.',
        sourceReferences: ['2024 DBMS End-Sem Exam Paper Q4(b)', 'Textbook Chapter 8.3'],
        actionRecommendation: 'Study the intersection rule: R1 ∩ R2 must functionally determine either R1 or R2.'
      },
      {
        id: 'gap_3nf_transitive',
        conceptId: 'c_3nf',
        conceptName: 'Transitive Dependency in 3NF',
        status: 'weak' as const,
        prerequisiteImportance: 10,
        examRelevance: 10,
        studentWeaknessScore: 0.75,
        sourceCoverageScore: 0.95,
        priorityScore: 85,
        primaryEvidence: 'Handwritten note reveals confusion between partial dependency (2NF) and transitive dependency (3NF).',
        sourceReferences: ['Handwritten Relational Derivation Notes', 'Prof. Vance Lecture Slide 14'],
        actionRecommendation: 'Address active student misconception before attempting complex multi-table decompositions.'
      },
      {
        id: 'gap_2nf_partial',
        conceptId: 'c_2nf',
        conceptName: '2NF Partial Dependency Resolution',
        status: 'weak' as const,
        prerequisiteImportance: 8,
        examRelevance: 8,
        studentWeaknessScore: 0.6,
        sourceCoverageScore: 0.95,
        priorityScore: 72,
        primaryEvidence: 'Diagnostic quiz showed partial understanding of composite key subsets.',
        sourceReferences: ['Prof. Vance Lecture Slide 14', 'SQL Anomaly Screenshot'],
        actionRecommendation: 'Review isolating candidate key subsets into separate relations.'
      },
      {
        id: 'gap_er_relational',
        conceptId: 'c_er_model',
        conceptName: 'ER Model to Relational Mapping',
        status: 'covered' as const,
        prerequisiteImportance: 7,
        examRelevance: 7,
        studentWeaknessScore: 0.1,
        sourceCoverageScore: 0.95,
        priorityScore: 25,
        primaryEvidence: 'Student achieved 90% mastery on conceptual entities and cardinality mapping.',
        sourceReferences: ['E-Commerce Schema ER Diagram'],
        actionRecommendation: 'Solid foundation. No intervention required.'
      }
    ];

    return {
      spaceId: 'space_dbms_demo',
      totalConceptsAnalyzed: 9,
      coveredCount: 3,
      weakCount: 2,
      missingCount: 2,
      gaps,
      topPriorityGapId: 'gap_3nf_transitive',
      generatedAt: new Date().toISOString()
    };
  }

  async generateDiagnosticQuestions(conceptId: string, conceptName: string, difficulty?: string): Promise<DiagnosticQuestion[]> {
    return [
      {
        id: 'diag_q1',
        conceptId: 'c_3nf',
        conceptName: '3NF (Third Normal Form)',
        questionText: 'What is the precise fundamental difference between a Second Normal Form (2NF) violation and a Third Normal Form (3NF) violation?',
        contextSnippet: 'Consider relation StudentCourse(StudentID, CourseID, Instructor, OfficeRoom) where (StudentID, CourseID) is the primary key.',
        questionType: 'conceptual_distinction',
        expectedRubric: 'Student must articulate that 2NF concerns partial dependencies (non-prime attribute depending on a subset of a composite candidate key), whereas 3NF concerns transitive dependencies (non-prime attribute depending on another non-prime attribute through an intermediary non-key).',
        commonMisconceptions: [
          'Confusing partial dependency with transitive dependency',
          'Believing 2NF applies to single-attribute candidate keys',
          'Assuming 3NF allows any functional dependency as long as 1NF is satisfied'
        ],
        suggestedAnswerPlaceholder: 'e.g., In 2NF, the issue is that a non-key attribute depends on only part of a composite key...',
        difficulty: 'medium'
      },
      {
        id: 'diag_q2',
        conceptId: 'c_bcnf',
        conceptName: 'BCNF (Boyce-Codd Normal Form)',
        questionText: 'Why can a relation be in 3NF but fail to be in BCNF? Provide the exact condition permitted in 3NF that BCNF forbids.',
        contextSnippet: 'Recall functional dependency X -> A where A is a prime attribute.',
        questionType: 'conceptual_distinction',
        expectedRubric: 'Student must identify the 3NF condition "or A is a prime attribute" when X is not a superkey. BCNF strictly disallows this.',
        commonMisconceptions: [
          'Thinking BCNF and 3NF are identical for all relations',
          'Assuming BCNF always preserves functional dependencies'
        ],
        suggestedAnswerPlaceholder: 'In 3NF, X -> A is allowed if A is prime, but in BCNF...',
        difficulty: 'hard'
      },
      {
        id: 'diag_q3',
        conceptId: 'c_lossless',
        conceptName: 'Lossless Decomposition',
        questionText: 'Given relation R(A, B, C) with FD A -> B, if we decompose into R1(A, B) and R2(B, C), is this decomposition lossless? Why or why not?',
        contextSnippet: 'Calculate the intersection R1 ∩ R2 and check if it determines either relation.',
        questionType: 'application',
        expectedRubric: 'Intersection is {B}. B does not determine {A} or {C}. Therefore, the decomposition is NOT lossless and produces spurious tuples.',
        commonMisconceptions: [
          'Assuming any decomposition with a shared attribute is lossless',
          'Confusing lossless join with dependency preservation'
        ],
        suggestedAnswerPlaceholder: 'The common attribute is B. Checking B -> A or B -> C...',
        difficulty: 'hard'
      }
    ];
  }

  async evaluateDiagnosticAnswer(question: DiagnosticQuestion, studentAnswer: string, currentMastery = 0.5): Promise<SemanticEvaluation> {
    const lower = studentAnswer.toLowerCase();

    // Check if the student exhibits the classic misconception: confusing partial and transitive dependencies
    const mentionsPartial = lower.includes('partial');
    const mentionsTransitive = lower.includes('transitive');
    const hasConfusion = (mentionsPartial && !mentionsTransitive) ||
      lower.includes('same') ||
      lower.includes('partial dependency causes 3nf') ||
      lower.includes('transitive is when part of the key') ||
      lower.includes('not full key') && lower.includes('3nf');

    if (hasConfusion || (!mentionsTransitive && mentionsPartial)) {
      return {
        questionId: question.id,
        conceptId: question.conceptId,
        conceptName: question.conceptName,
        studentAnswer,
        understood: [
          'Functional dependency concept',
          'Awareness that normal forms eliminate redundancy anomalies'
        ],
        partiallyUnderstood: [
          'Role of candidate keys in relational decomposition'
        ],
        misconceptions: [
          'Confusing partial dependency (2NF) with transitive dependency (3NF)',
          'Assuming that any non-key dependency is a 2NF issue regardless of whether the key is composite'
        ],
        hasMisconception: true,
        semanticAnalysisRationale: 'The student correctly grasps that functional dependencies dictate normal forms, but semantically conflates a partial key dependency (where attribute depends on part of a composite key) with a transitive dependency (where non-prime attribute depends on another non-prime attribute X -> Y -> Z).',
        correctiveInsight: 'Remember: 2NF ONLY applies when the candidate key is composite (has multiple attributes), and an attribute depends on just one piece. 3NF occurs even with a single-attribute key when a chain of determination exists: Key -> NonKeyA -> NonKeyB.',
        masteryScoreDelta: -0.15,
        newMasteryScore: Math.max(0.2, currentMastery - 0.15),
        recommendedNextLesson: {
          conceptId: 'c_3nf',
          lessonFocus: 'Visualizing Transitive vs Partial Dependencies using relational graph animation',
          recommendedDurationSeconds: 45
        }
      };
    }

    // Fully understood case
    if (mentionsPartial && mentionsTransitive) {
      return {
        questionId: question.id,
        conceptId: question.conceptId,
        conceptName: question.conceptName,
        studentAnswer,
        understood: [
          'Partial dependency: attribute depends on a proper subset of a composite candidate key (2NF)',
          'Transitive dependency: non-prime attribute depends on another non-prime attribute (3NF)',
          'Distinction between composite key violations and non-key chain violations'
        ],
        partiallyUnderstood: [],
        misconceptions: [],
        hasMisconception: false,
        semanticAnalysisRationale: 'The student demonstrated rigorous semantic distinction between 2NF partial dependencies and 3NF transitive dependencies with clear reference to candidate key structure.',
        correctiveInsight: 'Excellent conceptual precision. Ready to advance to Boyce-Codd Normal Form (BCNF) decomposition.',
        masteryScoreDelta: +0.25,
        newMasteryScore: Math.min(1.0, currentMastery + 0.25),
        recommendedNextLesson: {
          conceptId: 'c_bcnf',
          lessonFocus: 'Boyce-Codd Normal Form (BCNF) and Testing the Superkey Condition',
          recommendedDurationSeconds: 45
        }
      };
    }

    // Default partial case
    return {
      questionId: question.id,
      conceptId: question.conceptId,
      conceptName: question.conceptName,
      studentAnswer,
      understood: ['Basic relational terminology'],
      partiallyUnderstood: ['Normal form rules'],
      misconceptions: ['Incomplete formalization of dependency types'],
      hasMisconception: false,
      semanticAnalysisRationale: 'Answer is generic and lacks formal terminology regarding candidate key subsets versus transitive chains.',
      correctiveInsight: 'Focus on contrasting composite candidate keys (2NF) with transitive intermediaries (3NF).',
      masteryScoreDelta: +0.05,
      newMasteryScore: currentMastery + 0.05,
      recommendedNextLesson: {
        conceptId: question.conceptId,
        lessonFocus: 'Visualizing Normal Form Dependencies',
        recommendedDurationSeconds: 45
      }
    };
  }

  async generateVisualLessonPlan(
    conceptId: string,
    conceptName: string,
    targetMisconception?: string,
    targetDuration = 45
  ): Promise<StructuredLessonPlan> {
    const fps = 30;
    const totalFrames = targetDuration * fps; // 1350 frames for 45s

    // 6 frame-accurate structured steps mapped into integer frames
    const steps = [
      {
        id: 'step_1_source_anchor',
        type: 'show_source' as const,
        title: 'Source Anchor: Handwritten Relational Derivation',
        startFrame: 0,
        durationFrames: 180, // 0s - 6s
        sourceId: 'src_notes',
        sourceTitle: 'Handwritten Relational Derivation Notes',
        region: { x: 5, y: 10, width: 90, height: 45 },
        captionText: 'Let\'s inspect the exact derivation from your handwritten notes where the confusion occurred.',
        calloutLabel: 'Student Handwritten Note',
        latexFormula: 'R(A, B, C) \\quad \\text{Candidate Key} = \\{A\\}',
        voiceoverScript: 'Notice this relation in your notes: R with attributes A, B, and C, where A is the unique candidate key.',
        sourceExcerpt: 'From notes: "If A -> B and B -> C, then A -> C is transitive"',
        styleVariant: 'highlight_cyan' as const
      },
      {
        id: 'step_2_highlight_misconception',
        type: 'highlight_region' as const,
        title: 'Targeted Diagnosis: Where Partial vs Transitive Diverge',
        startFrame: 180,
        durationFrames: 240, // 6s - 14s
        sourceId: 'src_notes',
        sourceTitle: 'Handwritten Relational Derivation Notes',
        region: { x: 45, y: 55, width: 50, height: 35 },
        captionText: 'CRITICAL MISCONCEPTION: 2NF requires a COMPOSITE key (e.g., A, B). Here A is single-attribute!',
        calloutLabel: 'Misconception Hotspot',
        latexFormula: '\\text{Partial Dependency requires } \\exists K\' \\subset K \\text{ such that } K\' \\to Y',
        voiceoverScript: 'You wondered if partial implies transitive. But partial dependency is physically IMPOSSIBLE if the key is just a single attribute!',
        styleVariant: 'danger_rose' as const
      },
      {
        id: 'step_3_visual_diagram',
        type: 'diagram_callout' as const,
        title: 'Visual Chain: The Anatomy of a Transitive Dependency',
        startFrame: 420,
        durationFrames: 300, // 14s - 24s
        sourceId: 'src_slides',
        sourceTitle: 'Prof. Vance Lecture 14 Slides',
        region: { x: 10, y: 15, width: 80, height: 70 },
        captionText: 'Transitive: Non-key B acts as a stealth bridge to non-key C. Key A determines B, and B determines C.',
        calloutLabel: 'Transitive Bridge: A -> B -> C',
        latexFormula: 'A \\xrightarrow{\\text{determines}} B \\xrightarrow{\\text{determines}} C',
        voiceoverScript: 'Watch this chain. A determines B, and B determines C. Because B is NOT a candidate key, C is transitively dependent on A.',
        styleVariant: 'highlight_violet' as const
      },
      {
        id: 'step_4_real_world_example',
        type: 'equation_step' as const,
        title: 'Concrete Schema Example: Student, Dept, and Building',
        startFrame: 720,
        durationFrames: 270, // 24s - 33s
        sourceId: 'src_tb',
        sourceTitle: 'DBMS Textbook (Silberschatz)',
        region: { x: 15, y: 20, width: 70, height: 60 },
        captionText: 'StudentID -> DeptName, and DeptName -> Building. If CS moves to a new building, update anomaly occurs!',
        calloutLabel: 'Update Anomaly Illustrated',
        latexFormula: '\\text{StudentID} \\to \\text{DeptName} \\quad \\& \\quad \\text{DeptName} \\to \\text{Building}',
        voiceoverScript: 'In table Student: StudentID gives Department, Department gives Building. If CompSci moves buildings, you must update 500 rows.',
        styleVariant: 'warning_amber' as const
      },
      {
        id: 'step_5_decomposition_solution',
        type: 'show_source' as const,
        title: 'The 3NF Fix: Decompose into Two Clean Relations',
        startFrame: 990,
        durationFrames: 240, // 33s - 41s
        sourceId: 'src_slides',
        sourceTitle: 'Prof. Vance Lecture 14 Slides',
        region: { x: 10, y: 30, width: 80, height: 40 },
        captionText: 'Decompose: R1(StudentID, DeptName) and R2(DeptName, Building). Transitive anomaly vanished!',
        calloutLabel: '3NF Lossless Decomposition',
        latexFormula: 'R_1(\\underline{\\text{StudentID}}, \\text{DeptName}) \\quad \\& \\quad R_2(\\underline{\\text{DeptName}}, \\text{Building})',
        voiceoverScript: 'Split into two relations: Student to Department, and Department to Building. The transitive bridge is broken cleanly.',
        styleVariant: 'highlight_cyan' as const
      },
      {
        id: 'step_6_active_recall_checkpoint',
        type: 'quiz_checkpoint' as const,
        title: 'Active Recall Checkpoint: Verify Your Understanding',
        startFrame: 1230,
        durationFrames: 120, // 41s - 45s
        captionText: 'Quick Check: Can a relation with candidate key {ID} violate 2NF? (Hint: Is ID composite?)',
        calloutLabel: 'Active Recall Checkpoint',
        voiceoverScript: 'Now, answer this: If a table has only a single-column primary key, can it ever violate 2NF?',
        styleVariant: 'highlight_violet' as const
      }
    ];

    const tracks = [
      {
        id: 'track_sources',
        name: 'Visual Sources & Media',
        kind: 'source' as const,
        clipIds: ['step_1_source_anchor', 'step_5_decomposition_solution']
      },
      {
        id: 'track_overlays',
        name: 'Gemma Visual Highlights & Regions',
        kind: 'overlay' as const,
        clipIds: ['step_2_highlight_misconception', 'step_3_visual_diagram']
      },
      {
        id: 'track_captions',
        name: 'Synchronized Captions & Audio',
        kind: 'text' as const,
        clipIds: ['step_4_real_world_example']
      },
      {
        id: 'track_checkpoints',
        name: 'Active Recall Interactive Quizzes',
        kind: 'checkpoint' as const,
        clipIds: ['step_6_active_recall_checkpoint']
      }
    ];

    return {
      id: 'lesson_3nf_transitive_fix',
      spaceId: 'space_dbms_demo',
      conceptId: conceptId || 'c_3nf',
      lessonTitle: 'Mastering 3NF: Eliminating the Transitive Dependency Misconception',
      targetMisconception: targetMisconception || 'Confusing partial dependency with transitive dependency',
      durationSeconds: targetDuration,
      fps,
      totalFrames,
      summary: 'A fast, high-impact 45-second visual lesson connecting the student\'s handwritten derivation directly to the lecture slide and textbook decomposition.',
      steps,
      tracks,
      pedagogicalRationale: 'Anchors directly on student\'s own handwritten note to maximize emotional relevance, pinpoints the logical divergence, introduces the visual transitive chain, demonstrates the anomaly, and executes the decomposition.',
      traceableSourceIds: ['src_notes', 'src_slides', 'src_tb'],
      version: 1,
      createdAt: new Date().toISOString()
    };
  }

  async interpretNaturalLanguageEdit(currentLesson: StructuredLessonPlan, editRequest: string): Promise<StructuredEditPlan> {
    const prompt = editRequest.toLowerCase();
    const cloned = JSON.parse(JSON.stringify(currentLesson)) as StructuredLessonPlan;
    cloned.version += 1;

    let rationale = '';
    const operations: any[] = [];
    const diffs: string[] = [];

    if (prompt.includes('diagram before') || prompt.includes('before the formula') || prompt.includes('reorder')) {
      // Reorder: step 3 (diagram) moves before step 2
      rationale = 'Reordered visual presentation to showcase the ER / Dependency Diagram (Step 3) before analyzing the mathematical derivation formula.';
      const step2 = cloned.steps[1];
      const step3 = cloned.steps[2];

      // Swap their contents and adjust start frames
      const originalStep2Start = step2.startFrame;
      step3.startFrame = originalStep2Start;
      step2.startFrame = originalStep2Start + step3.durationFrames;

      cloned.steps[1] = step3;
      cloned.steps[2] = step2;

      operations.push({
        op: 'reorder_steps',
        description: 'Swapped Step 2 (Diagnosis) and Step 3 (Visual Diagram Callout) to introduce conceptual intuition first.',
        parameters: { previousOrder: [1, 2], newOrder: [2, 1] }
      });
      diffs.push('Moved "Visual Chain: Anatomy of Transitive Dependency" to Frame ' + step3.startFrame + ' (06.00s)');
      diffs.push('Shifted "Targeted Diagnosis Formula" to Frame ' + step2.startFrame + ' (16.00s)');
    } else if (prompt.includes('slow down') || prompt.includes('longer') || prompt.includes('normalization example')) {
      // Lengthen example
      rationale = 'Expanded the real-world normalization example step duration by 50% and slowed down caption pacing.';
      const exampleStep = cloned.steps.find(s => s.id === 'step_4_real_world_example');
      if (exampleStep) {
        const addedFrames = 150; // 5 extra seconds
        exampleStep.durationFrames += addedFrames;
        cloned.totalFrames += addedFrames;
        cloned.durationSeconds = Math.round(cloned.totalFrames / cloned.fps);

        // Adjust subsequent steps
        for (let i = 4; i < cloned.steps.length; i++) {
          cloned.steps[i].startFrame += addedFrames;
        }

        operations.push({
          op: 'adjust_timing',
          description: 'Extended Step 4 duration from 270 to 420 frames (+5.0s) for deeper explanation.',
          targetStepId: 'step_4_real_world_example',
          parameters: { durationDeltaFrames: addedFrames }
        });
        diffs.push('Extended "Concrete Schema Example" duration to 14.0 seconds (420 frames)');
        diffs.push('Total lesson duration adjusted to ' + cloned.durationSeconds + ' seconds');
      }
    } else if (prompt.includes('30 seconds') || prompt.includes('shorter') || prompt.includes('trim')) {
      // Shorten to 30s
      rationale = 'Compressed lesson to high-tempo 30-second review by tightening transitions and trimming voiceover pauses.';
      const newDuration = 30;
      const newTotalFrames = newDuration * cloned.fps;
      const ratio = newTotalFrames / cloned.totalFrames;

      let currentFrame = 0;
      for (const step of cloned.steps) {
        step.startFrame = Math.round(currentFrame);
        step.durationFrames = Math.max(30, Math.round(step.durationFrames * ratio));
        currentFrame += step.durationFrames;
      }
      cloned.totalFrames = currentFrame;
      cloned.durationSeconds = Math.round(currentFrame / cloned.fps);

      operations.push({
        op: 'rescale_total_duration',
        description: 'Proportionally scaled all clip frame durations to target 30-second target.',
        parameters: { targetSeconds: 30 }
      });
      diffs.push('Scaled timeline duration from 45.0s to ' + cloned.durationSeconds + 's');
      diffs.push('Tightened 6 visual clips to preserve high cognitive density');
    } else if (prompt.includes('beginner') || prompt.includes('simple')) {
      rationale = 'Simplified technical jargon and substituted formal relational algebra with intuitive color-coded cards.';
      const target = cloned.steps[1];
      if (target) {
        target.captionText = 'SIMPLIFIED: 2NF is about team keys (composite). 3NF is about a domino effect (A triggers B, B triggers C)!';
        target.calloutLabel = 'Beginner Intuition';
      }
      operations.push({
        op: 'simplify_vocabulary',
        description: 'Substituted formal FD notation with domino-chain pedagogical analogy.',
        parameters: { targetLevel: 'introductory' }
      });
      diffs.push('Replaced relational math with "domino chain" intuitive caption');
    } else {
      // Default refinement: highlight exam relevance
      rationale = 'Enhanced exam relevance markers and added direct question paper citations to captions.';
      cloned.steps[0].captionText += ' [Matches 2024 End-Sem Exam Q4 Pattern]';
      operations.push({
        op: 'exam_focus_filter',
        description: 'Injected university exam marks and question pattern badges into the timeline clips.',
        parameters: { examPaperId: 'exam_2024' }
      });
      diffs.push('Annotated Step 1 with University Exam 10-Mark pattern reference');
    }

    const editPlanId = 'edit_' + Date.now();

    return {
      editPlanId,
      lessonId: currentLesson.id,
      naturalLanguageRequest: editRequest,
      aiInterpretation: rationale,
      operations,
      proposedLessonPlan: cloned,
      validation: {
        isValid: true,
        errors: [],
        warnings: [],
        frameCollisionDetected: false,
        checkedTotalFrames: cloned.totalFrames
      },
      previewDiffSummary: diffs,
      createdAt: new Date().toISOString()
    };
  }
}
