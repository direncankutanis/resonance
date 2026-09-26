import os
import unittest
from unittest.mock import patch
from integrations.hosted import service as s

class ServiceTests(unittest.TestCase):
    def test_payload(self):
        for raw in ['{}','{"amountMinor":true}','{"amountMinor":2001.5}','{"amountMinor":100,"amountMinor":200}','{"amountMinor":100,"url":"https://other"}']:
            with self.assertRaises(ValueError): s.parse_body(raw,'latch')
        self.assertEqual(s.parse_body('{"amountMinor":2000}','latch')['amountMinor'],2000)
        for raw in ['{"prompt":""}','{"prompt":42}','{"prompt":"hello","extra":1}']:
            with self.assertRaises(ValueError):s.parse_body(raw,'ai')
    def test_disabled(self):
        with patch.dict(os.environ,{},clear=True),patch.object(s,'admit') as limit:
            self.assertEqual(s.process('ai',{'prompt':'hello'})[0],503)
            limit.assert_not_called()
    def test_limit_and_failure_never_call_model(self):
        env={'RESONANCE_HOSTED_SERVICES':'enabled','GEMINI_API_KEY':'fake-test-key'}
        with patch.dict(os.environ,env,clear=True),patch.object(s,'generate_plan') as model:
            with patch.object(s,'admit',return_value=(False,60)):
                self.assertEqual(s.process('ai',{'prompt':'hello'})[0],429)
            with patch.object(s,'admit',side_effect=s.Unavailable):
                self.assertEqual(s.process('ai',{'prompt':'hello'})[0],503)
            model.assert_not_called()
    def test_provider_after_admission(self):
        with patch.dict(os.environ,{'RESONANCE_HOSTED_SERVICES':'enabled','GEMINI_API_KEY':'test'},clear=True),patch.object(s,'admit',return_value=(True,1)),patch.object(s,'generate_plan',return_value={'action':'buy'}) as model:
            code,body,_=s.process('ai',{'prompt':'plan'})
            self.assertEqual(code,200);self.assertFalse(body['executed']);model.assert_called_once_with('plan',api_key='test')
    def test_latch_allow_deny_error(self):
        with patch.dict(os.environ,{'RESONANCE_HOSTED_SERVICES':'enabled','LATCH_TOKEN':'test'},clear=True),patch.object(s,'admit',return_value=(True,1)):
            for response,code,decision in [((200,{'status':'proposal_accepted','executed':False}),200,'allow'),((403,{'deniedBy':['cap']}),200,'deny'),((200,{'executed':True}),503,None)]:
                with patch.object(s,'json_request',return_value=response):
                    status,body,_=s.process('latch',{'amountMinor':2000});self.assertEqual(status,code);self.assertEqual(body.get('decision'),decision);self.assertFalse(body['executed'])
    def test_counter_command_and_response(self):
        env={'UPSTASH_REDIS_REST_URL':'https://example.upstash.io','UPSTASH_REDIS_REST_TOKEN':'test'}
        with patch.dict(os.environ,env,clear=True),patch.object(s,'json_request',return_value=(200,{'result':[1,0]})) as request:
            self.assertTrue(s.admit('ai')[0]);command=request.call_args.args[1];self.assertEqual(command[0],'EVAL');self.assertEqual(command[-2:],[20,10])
        with patch.dict(os.environ,env,clear=True),patch.object(s,'json_request',return_value=(200,{'result':[True,0]})):
            with self.assertRaises(s.Unavailable):s.admit('ai')

class ModelResponseTests(unittest.TestCase):
    def test_checked_response_and_truncation(self):
        import io, json
        from integrations.latch import ai_plans as ai
        plan = {'action':'buy','asset':'DEMO','budgetMinor':1500,'limitMinor':800,'expirySteps':5,'explanation':'Buy at the stated price.'}
        response = {'candidates':[{'finishReason':'STOP','content':{'parts':[{'thought':True,'text':'not the answer'},{'text':json.dumps(plan)}]}}]}
        with patch.object(ai.urllib.request, 'urlopen', return_value=io.BytesIO(json.dumps(response).encode())) as provider:
            self.assertEqual(ai.generate_plan('15 RLO, price 8, expiry 5', api_key='test'), plan)
            payload = json.loads(provider.call_args.args[0].data)
            self.assertEqual(payload['generationConfig']['thinkingConfig']['thinkingLevel'], 'minimal')
        response['candidates'][0]['finishReason'] = 'MAX_TOKENS'
        with patch.object(ai.urllib.request, 'urlopen', return_value=io.BytesIO(json.dumps(response).encode())):
            with self.assertRaises(ai.AIUnavailable) as error: ai.generate_plan('test', api_key='test')
            self.assertEqual(error.exception.code, 'invalid_response')

class HTTPTests(unittest.TestCase):
    def test_http_boundary(self):
        import threading
        from http.server import ThreadingHTTPServer
        from http.client import HTTPConnection
        class Handler(s.ServiceHandler):
            kind = 'ai'
        server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        def request(body, headers):
            connection = HTTPConnection(*server.server_address, timeout=2)
            connection.request('POST', '/api/ai/plan', body, headers)
            response = connection.getresponse()
            result = response.status, response.getheader('Cache-Control'), response.getheader('Retry-After')
            response.read(); connection.close()
            return result
        headers = {'Origin':s.ORIGIN,'X-Resonance-Request':'proposal-check','Content-Type':'application/json'}
        try:
            with patch.object(s, 'process', return_value=(429, {'code':'shared_limit'}, 60)) as process:
                self.assertEqual(request('{"prompt":"hello"}', {})[0], 403)
                self.assertEqual(request('{"prompt":"a","prompt":"b"}', headers)[0], 400)
                self.assertEqual(request('x'*4097, headers)[0], 400)
                process.assert_not_called()
                self.assertEqual(request('{"prompt":"hello"}', headers), (429, 'private, no-store', '60'))
                process.assert_called_once_with('ai', {'prompt':'hello'})
        finally:
            server.shutdown(); server.server_close(); thread.join()

if __name__=='__main__':unittest.main()
