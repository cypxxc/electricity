--
-- PostgreSQL database dump
--

\restrict RR4EttmnTa6KPXhvI9deKJjOskqikJspFuQXKfsrEW7acRh68RvDhWEMwXaHvRX

-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP INDEX IF EXISTS public.year_be_month_unique_idx;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_username_unique;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.electricity_records DROP CONSTRAINT IF EXISTS electricity_records_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.electricity_records ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.electricity_records_id_seq;
DROP TABLE IF EXISTS public.electricity_records;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: electricity_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.electricity_records (
    id integer NOT NULL,
    year_be integer NOT NULL,
    year_ce integer NOT NULL,
    month integer NOT NULL,
    amount numeric(12,2) NOT NULL,
    note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.electricity_records OWNER TO postgres;

--
-- Name: electricity_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.electricity_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.electricity_records_id_seq OWNER TO postgres;

--
-- Name: electricity_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.electricity_records_id_seq OWNED BY public.electricity_records.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password_hash text NOT NULL,
    role character varying(20) DEFAULT 'admin'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: electricity_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.electricity_records ALTER COLUMN id SET DEFAULT nextval('public.electricity_records_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: electricity_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.electricity_records (id, year_be, year_ce, month, amount, note, created_at, updated_at) FROM stdin;
1	2562	2019	10	26488.75	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.808755+00	2026-10-28 08:57:59.808755+00
2	2562	2019	11	26844.57	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.814443+00	2026-10-28 08:57:59.814443+00
3	2562	2019	12	25033.97	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.819083+00	2026-10-28 08:57:59.819083+00
4	2563	2020	1	24057.00	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.822057+00	2026-10-28 08:57:59.822057+00
5	2563	2020	2	20287.41	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.824434+00	2026-10-28 08:57:59.824434+00
6	2563	2020	3	28958.51	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.826682+00	2026-10-28 08:57:59.826682+00
7	2563	2020	4	25051.88	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.829015+00	2026-10-28 08:57:59.829015+00
8	2563	2020	5	32485.35	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.831549+00	2026-10-28 08:57:59.831549+00
9	2563	2020	6	28439.98	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.836169+00	2026-10-28 08:57:59.836169+00
10	2563	2020	7	26108.47	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.838596+00	2026-10-28 08:57:59.838596+00
11	2563	2020	8	28426.83	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.840698+00	2026-10-28 08:57:59.840698+00
12	2563	2020	9	20593.97	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.843112+00	2026-10-28 08:57:59.843112+00
13	2563	2020	10	25904.18	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.845464+00	2026-10-28 08:57:59.845464+00
14	2563	2020	11	18301.24	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.847942+00	2026-10-28 08:57:59.847942+00
15	2563	2020	12	11820.83	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.852061+00	2026-10-28 08:57:59.852061+00
16	2564	2021	1	12904.60	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.854765+00	2026-10-28 08:57:59.854765+00
17	2564	2021	2	19348.21	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.857186+00	2026-10-28 08:57:59.857186+00
18	2564	2021	3	28123.85	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.859822+00	2026-10-28 08:57:59.859822+00
19	2564	2021	4	29664.15	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.862273+00	2026-10-28 08:57:59.862273+00
20	2564	2021	5	31744.34	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.865044+00	2026-10-28 08:57:59.865044+00
21	2564	2021	6	34198.85	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.86944+00	2026-10-28 08:57:59.86944+00
22	2564	2021	7	38266.73	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.871933+00	2026-10-28 08:57:59.871933+00
23	2564	2021	8	39756.41	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.874017+00	2026-10-28 08:57:59.874017+00
24	2564	2021	9	31795.17	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.876028+00	2026-10-28 08:57:59.876028+00
25	2564	2021	10	33570.02	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.878068+00	2026-10-28 08:57:59.878068+00
26	2564	2021	11	40990.88	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.880312+00	2026-10-28 08:57:59.880312+00
27	2564	2021	12	22934.03	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.882506+00	2026-10-28 08:57:59.882506+00
28	2565	2022	1	29366.17	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.886242+00	2026-10-28 08:57:59.886242+00
29	2565	2022	2	27526.51	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.888638+00	2026-10-28 08:57:59.888638+00
30	2565	2022	3	48416.08	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.890699+00	2026-10-28 08:57:59.890699+00
31	2565	2022	4	48163.31	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.892803+00	2026-10-28 08:57:59.892803+00
32	2565	2022	5	38345.00	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.895112+00	2026-10-28 08:57:59.895112+00
33	2565	2022	6	61167.65	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.897505+00	2026-10-28 08:57:59.897505+00
34	2565	2022	7	49672.94	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.900103+00	2026-10-28 08:57:59.900103+00
35	2565	2022	8	45524.55	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.905658+00	2026-10-28 08:57:59.905658+00
36	2565	2022	9	59648.80	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.908745+00	2026-10-28 08:57:59.908745+00
37	2565	2022	10	46597.00	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.911339+00	2026-10-28 08:57:59.911339+00
38	2565	2022	11	60918.11	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.913972+00	2026-10-28 08:57:59.913972+00
39	2565	2022	12	35332.33	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.916625+00	2026-10-28 08:57:59.916625+00
40	2566	2023	1	32474.00	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.921823+00	2026-10-28 08:57:59.921823+00
41	2566	2023	2	46433.59	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.924305+00	2026-10-28 08:57:59.924305+00
42	2566	2023	3	64249.54	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.926407+00	2026-10-28 08:57:59.926407+00
43	2566	2023	4	77409.80	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.928649+00	2026-10-28 08:57:59.928649+00
44	2566	2023	5	78936.53	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.930929+00	2026-10-28 08:57:59.930929+00
45	2566	2023	6	73199.24	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.933147+00	2026-10-28 08:57:59.933147+00
46	2566	2023	7	62319.21	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.937002+00	2026-10-28 08:57:59.937002+00
47	2566	2023	8	54664.32	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.939187+00	2026-10-28 08:57:59.939187+00
48	2566	2023	9	44062.91	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.941292+00	2026-10-28 08:57:59.941292+00
49	2566	2023	10	45224.51	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.943525+00	2026-10-28 08:57:59.943525+00
50	2566	2023	11	43957.91	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.945762+00	2026-10-28 08:57:59.945762+00
51	2566	2023	12	37760.00	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.948237+00	2026-10-28 08:57:59.948237+00
52	2567	2024	1	36577.14	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.951446+00	2026-10-28 08:57:59.951446+00
53	2567	2024	2	43646.54	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.956413+00	2026-10-28 08:57:59.956413+00
54	2567	2024	3	67960.57	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.959142+00	2026-10-28 08:57:59.959142+00
55	2567	2024	4	76130.33	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.961349+00	2026-10-28 08:57:59.961349+00
56	2567	2024	5	76220.07	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.963431+00	2026-10-28 08:57:59.963431+00
57	2567	2024	6	69915.90	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.965609+00	2026-10-28 08:57:59.965609+00
58	2567	2024	7	48897.27	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.969309+00	2026-10-28 08:57:59.969309+00
59	2567	2024	8	58292.58	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.97189+00	2026-10-28 08:57:59.97189+00
60	2567	2024	9	50731.79	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.973995+00	2026-10-28 08:57:59.973995+00
61	2567	2024	10	50731.79	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.975931+00	2026-10-28 08:57:59.975931+00
62	2567	2024	11	52856.87	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.977977+00	2026-10-28 08:57:59.977977+00
63	2567	2024	12	35182.14	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.979828+00	2026-10-28 08:57:59.979828+00
64	2568	2025	1	25710.17	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.981785+00	2026-10-28 08:57:59.981785+00
65	2568	2025	2	33252.38	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.983991+00	2026-10-28 08:57:59.983991+00
66	2568	2025	3	54688.66	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.987406+00	2026-10-28 08:57:59.987406+00
67	2568	2025	4	58142.51	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.989516+00	2026-10-28 08:57:59.989516+00
68	2568	2025	5	60828.41	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.991368+00	2026-10-28 08:57:59.991368+00
69	2568	2025	6	53682.48	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.993156+00	2026-10-28 08:57:59.993156+00
70	2568	2025	7	42001.76	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.995005+00	2026-10-28 08:57:59.995005+00
71	2568	2025	8	52035.65	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.996949+00	2026-10-28 08:57:59.996949+00
72	2568	2025	9	43877.38	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:57:59.998837+00	2026-10-28 08:57:59.998837+00
73	2568	2025	10	43301.33	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:58:00.001159+00	2026-10-28 08:58:00.001159+00
74	2568	2025	11	34105.66	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:58:00.006806+00	2026-10-28 08:58:00.006806+00
75	2568	2025	12	27620.13	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:58:00.009816+00	2026-10-28 08:58:00.009816+00
76	2569	2026	1	28241.03	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:58:00.013432+00	2026-10-28 08:58:00.013432+00
77	2569	2026	2	40484.53	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:58:00.016008+00	2026-10-28 08:58:00.016008+00
78	2569	2026	3	45075.52	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:58:00.018428+00	2026-10-28 08:58:00.018428+00
79	2569	2026	4	57423.79	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:58:00.022708+00	2026-10-28 08:58:00.022708+00
80	2569	2026	5	55061.68	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:58:00.025358+00	2026-10-28 08:58:00.025358+00
81	2569	2026	6	53906.66	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:58:00.027534+00	2026-10-28 08:58:00.027534+00
82	2569	2026	7	49344.49	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:58:00.029788+00	2026-10-28 08:58:00.029788+00
83	2569	2026	8	48240.06	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:58:00.031851+00	2026-10-28 08:58:00.031851+00
84	2569	2026	9	41271.04	นำเข้าจากไฟล์สรุปค่าไฟฟ้า 62-69.xlsx	2026-10-28 08:58:00.033919+00	2026-10-28 08:58:00.033919+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password_hash, role, created_at) FROM stdin;
1	admin	$2b$10$6PwYmiZTYuKBeMpxyKm4AOldvGCHm6XzXt5qX6Y.RBb4os26.idH6	admin	2026-10-28 08:58:00.093704+00
2	cypxxc	$2a$12$I7CpbTRhLHpTUtIJuTseNOj7RmhxIaHK7KQmEJ/jZywffQ5f/gtIG	admin	2026-10-29 01:13:04.031608+00
\.


--
-- Name: electricity_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.electricity_records_id_seq', 88, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: electricity_records electricity_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.electricity_records
    ADD CONSTRAINT electricity_records_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: year_be_month_unique_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX year_be_month_unique_idx ON public.electricity_records USING btree (year_be, month);


--
-- PostgreSQL database dump complete
--

\unrestrict RR4EttmnTa6KPXhvI9deKJjOskqikJspFuQXKfsrEW7acRh68RvDhWEMwXaHvRX

