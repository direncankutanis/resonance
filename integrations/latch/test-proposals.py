import importlib.util
import json
import threading
import unittest
import urllib.request
import urllib.error
from pathlib import Path
from http.server import ThreadingHTTPServer

spec = importlib.util.spec_from_file_location('upstream', Path(__file__).with_name('proposal-server.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

class Tests(unittest.TestCase):
    def test_scenarios(self):
        data = json.loads(Path(__file__).with_name('proposal-policy.example.json').read_text())
        for case in data['scenarios']:
            with self.subTest(case=case['name']):
                self.assertEqual(m.validate(case['body']) is None, case['expected'].startswith('allow'))
        self.assertIsNotNone(m.validate({'action':'buy','asset':'DEMO','amountMinor':True}))

    def test_http_boundary(self):
        server = ThreadingHTTPServer(('127.0.0.1', 0), m.make_handler('test-only-secret-not-a-live-credential'))
        t = threading.Thread(target=server.serve_forever, daemon=True); t.start()
        def call(body, token='test-only-secret-not-a-live-credential', path='/proposals'):
            req = urllib.request.Request('http://127.0.0.1:%d%s' % (server.server_port, path),data=body,
                headers={'Content-Type':'application/json', 'Authorization':'Bearer '+token})
            try:
                with urllib.request.urlopen(req) as r: return r.status, json.load(r)
            except urllib.error.HTTPError as e: return e.code, json.load(e)
        try:
            good=b'{"action":"buy","asset":"DEMO","amountMinor":2000}'
            status, response = call(good)
            self.assertEqual(status,200); self.assertIs(response['executed'],False)
            self.assertEqual(call(good,token='wrong')[0],401)
            self.assertEqual(call(good,path='/other')[0],404)
            self.assertEqual(call(good.replace(b'2000',b'3000'))[0],422)
            self.assertEqual(call(b'{"action":"buy","action":"sell"}')[0],400)
            self.assertEqual(call(b'x'*4097)[0],413)
        finally:
            server.shutdown(); server.server_close(); t.join()

if __name__ == '__main__': unittest.main()
