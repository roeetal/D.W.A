s = '''
 +-- family NN nsubj
 |   +-- The DT det
 +-- puppy NN dobj
     +-- a DT det
     +-- and CC cc
     +-- kitten NN conj'''


stack = []
for token in tokens:
    stack.append(token)


